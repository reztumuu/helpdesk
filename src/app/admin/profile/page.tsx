'use client';
import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    const u = raw ? JSON.parse(raw) : null;
    if (!token || !u) {
      router.replace('/admin/login');
      return;
    }
    setName(u.name || '');
    setEmail(u.email || '');
    setAvatarUrl(u.avatarUrl || '');
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setName(d.name || '');
        setEmail(d.email || '');
      }
    } catch {}
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/profile/photo/upload', {
        method: 'POST',
        body: fd,
      });
      if (res.ok) {
        const d = await res.json();
        setAvatarUrl(d.url);
      } else {
        setError('Upload gagal');
      }
    } catch {
      setError('Upload gagal');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        const raw = localStorage.getItem('user');
        const u = raw ? JSON.parse(raw) : {};
        const merged = { ...u, name: updated.name, email: updated.email, avatarUrl };
        localStorage.setItem('user', JSON.stringify(merged));
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
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="px-6 py-6 sm:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
          <p className="mt-1 text-white/80 text-sm sm:text-base">Kelola informasi akun Anda.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Foto Profil</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No photo</span>
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAvatarFileName(e.target.files[0].name);
                    handleUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
            {avatarFileName && (
              <span className="text-xs text-gray-500">{avatarFileName}</span>
            )}
          </div>
        </Card>
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold mb-4">Informasi Akun</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengganti"
                type="password"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
