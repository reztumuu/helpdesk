'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type WebsiteItem = { id: string; name: string; settings?: any };

export default function SettingsPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [position, setPosition] = useState<string>('bottom_right');
  const [primaryColor, setPrimaryColor] = useState<string>('#2563eb');
  const [iconUrl, setIconUrl] = useState<string>('');
  const [offsetX, setOffsetX] = useState<number>(20);
  const [offsetY, setOffsetY] = useState<number>(50);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      if (!u || u.role !== 'super_admin') {
        router.replace('/admin/dashboard');
        return;
      }
    } catch {
      router.replace('/admin/dashboard');
      return;
    }
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/websites', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setWebsites(data);
        if (data.length > 0) {
          const w = data[0];
          setSelectedId(w.id);
          const s = w.settings || {};
          setPosition(s.position || 'bottom_right');
          setPrimaryColor(s.primary_color || '#2563eb');
          try {
            const custom = s.custom_css ? JSON.parse(s.custom_css) : {};
            setIconUrl(custom.iconUrl || '');
            setOffsetX(typeof custom.offsetX === 'number' ? custom.offsetX : 20);
            setOffsetY(typeof custom.offsetY === 'number' ? custom.offsetY : 50);
          } catch {
            setIconUrl('');
            setOffsetX(20);
            setOffsetY(50);
          }
        }
      }
    } catch {}
  };

  const handleSelectWebsite = (id: string) => {
    setSelectedId(id);
    const w = websites.find((x) => x.id === id);
    const s = w?.settings || {};
    setPosition(s.position || 'bottom_right');
    setPrimaryColor(s.primary_color || '#2563eb');
    try {
      const custom = s.custom_css ? JSON.parse(s.custom_css) : {};
      setIconUrl(custom.iconUrl || '');
      setOffsetX(typeof custom.offsetX === 'number' ? custom.offsetX : 20);
      setOffsetY(typeof custom.offsetY === 'number' ? custom.offsetY : 50);
    } catch {
      setIconUrl('');
      setOffsetX(20);
      setOffsetY(50);
    }
  };

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/widget/icon/upload', {
        method: 'POST',
        body: fd,
      });
      if (res.ok) {
        const d = await res.json();
        setIconUrl(d.url);
      } else {
        setError('Upload gagal');
      }
    } catch {
      setError('Upload gagal');
    }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/websites/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          websiteId: selectedId,
          position,
          primaryColor,
          customization: { iconUrl, offsetX, offsetY },
        }),
      });
      if (res.ok) {
        await fetchWebsites();
      } else {
        const err = await res.json().catch(() => ({ error: 'Gagal menyimpan' }));
        setError(err.error || 'Gagal menyimpan');
      }
    } catch {
      setError('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Widget Settings</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
        <select
          value={selectedId}
          onChange={(e) => handleSelectWebsite(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          {websites.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4">Icon</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
              {iconUrl ? (
                <img src={iconUrl} alt="Widget Icon" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No icon</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && e.target.files[0] && handleUpload(e.target.files[0])}
              className="text-sm"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4">Position</h3>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="position"
                value="bottom_right"
                checked={position === 'bottom_right' || position === 'bottom-right'}
                onChange={(e) => setPosition(e.target.value)}
              />
              <span>Bottom Right</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="position"
                value="bottom_left"
                checked={position === 'bottom_left' || position === 'bottom-left'}
                onChange={(e) => setPosition(e.target.value)}
              />
              <span>Bottom Left</span>
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offset X (px)</label>
              <input
                type="number"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value || '0', 10))}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offset Y (px)</label>
              <input
                type="number"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value || '0', 10))}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="font-semibold mb-4">Primary Color</h3>
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="w-16 h-10 p-0 border rounded"
        />
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
