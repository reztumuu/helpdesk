"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Upload,
  Save,
  AlertTriangle,
  Fingerprint,
  Camera,
} from "lucide-react";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    if (!token || !u) {
      router.replace("/admin/login");
      return;
    }
    setName(u.name || "");
    setEmail(u.email || "");
    setAvatarUrl(u.avatarUrl || "");
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setName(d.name || "");
        setEmail(d.email || "");
      }
    } catch {}
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/profile/photo/upload", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const d = await res.json();
        setAvatarUrl(d.url);
      } else {
        setError("Upload Failed");
      }
    } catch {
      setError("Upload Failed");
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
        const raw = localStorage.getItem("user");
        const u = raw ? JSON.parse(raw) : {};
        const merged = {
          ...u,
          name: updated.name,
          email: updated.email,
          avatarUrl,
        };
        localStorage.setItem("user", JSON.stringify(merged));

        // Dispatch event for sidebar update if implemented
        window.dispatchEvent(new CustomEvent("helpdesk-profile-updated"));
      } else {
        const err = await res.json().catch(() => ({ error: "Update Failed" }));
        setError(err.error || "Update Failed");
      }
    } catch {
      setError("Update Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-8 relative ${display.className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-foreground pb-8 mb-8 gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none">
            Identity_
          </h1>
          <p
            className={`text-lg md:text-xl font-bold uppercase tracking-widest bg-foreground text-background inline-flex items-center gap-2 px-3 py-1 mt-2 w-fit ${mono.className}`}
          >
            <Fingerprint className="w-5 h-5" /> Credentials & Access
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className={`mr-6 flex items-center gap-2 border-4 border-foreground bg-green-500 text-white px-6 py-3 font-bold uppercase tracking-widest shadow-[6px_6px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_currentColor] transition-all focus:outline-none focus:ring-4 focus:ring-foreground/20 active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[6px_6px_0_0_currentColor] ${mono.className}`}
        >
          <Save className="w-5 h-5" />
          {saving ? "Writing..." : "Update Sys"}
        </button>
      </div>

      {error && (
        <div
          className={`border-4 border-red-500 bg-red-500/10 text-red-600 p-4 flex items-center gap-4 font-bold uppercase tracking-widest shadow-[6px_6px_0_0_#ef4444] ${mono.className}`}
        >
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <span>ERR: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 relative z-10">
        {/* Avatar Section */}
        <div className="border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] flex flex-col items-center p-8">
          <div className="border-b-4 border-foreground w-[calc(100%+4rem)] -mt-8 mb-8 bg-foreground text-background p-4 flex justify-between items-center">
            <h2
              className={`font-bold uppercase tracking-widest flex items-center gap-2 text-sm ${mono.className}`}
            >
              <Camera className="w-4 h-4" /> Visual Auth / Avatar
            </h2>
          </div>

          <div className="relative group mb-8">
            <div className="w-48 h-48 border-4 border-foreground bg-foreground/5 overflow-hidden flex items-center justify-center shadow-[8px_8px_0_0_currentColor] transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[12px_12px_0_0_currentColor]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-20 h-20 opacity-20" />
              )}
            </div>

            <label
              className={`absolute -bottom-4 -right-4 border-4 border-foreground bg-blue-500 text-white p-3 shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_currentColor] transition-all cursor-pointer ${mono.className}`}
            >
              <Upload className="w-6 h-6" />
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
          </div>

          {avatarFileName && (
            <div
              className={`text-xs font-bold uppercase tracking-widest bg-foreground text-background px-3 py-1 text-center truncate w-full ${mono.className}`}
            >
              {avatarFileName}
            </div>
          )}
          {!avatarFileName && (
            <div
              className={`text-xs font-bold uppercase tracking-widest opacity-50 px-3 py-1 text-center ${mono.className}`}
            >
              Awaiting Input
            </div>
          )}
        </div>
        <div className="border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] flex flex-col">
          <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
            <h2
              className={`font-bold uppercase tracking-widest flex items-center gap-2 text-sm ${mono.className}`}
            >
              <User className="w-4 h-4" /> Operator Details
            </h2>
          </div>

          <form className="p-8 space-y-8" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label
                  className={`block text-sm font-bold uppercase tracking-widest items-center gap-2 ${mono.className}`}
                >
                  <User className="w-4 h-4" /> Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border-4 border-foreground bg-background p-4 font-bold text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                  placeholder="Operator Name"
                />
              </div>

              <div className="space-y-4">
                <label
                  className={`block text-sm font-bold uppercase tracking-widest items-center gap-2 ${mono.className}`}
                >
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className={`w-full border-4 border-foreground bg-background p-4 font-bold text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                  placeholder="agent@system.local"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label
                  className={`block text-sm font-bold uppercase tracking-widest items-center gap-2 ${mono.className}`}
                >
                  <Lock className="w-4 h-4" /> Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="[ LEAVE BLANK TO RETAIN CURRENT KEY ]"
                  className={`w-full border-4 border-foreground bg-background p-4 font-bold text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                />
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${mono.className}`}
                >
                  WARNING: Assigning a new password will instantly invalidate
                  previous credentials.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
