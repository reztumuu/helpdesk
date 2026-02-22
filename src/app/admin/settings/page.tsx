"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Crosshair,
  Trash2,
  Globe,
  PaintBucket,
} from "lucide-react";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

type WebsiteItem = {
  id: string;
  name: string;
  domain?: string;
  settings?: any;
};

export default function SettingsPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [position, setPosition] = useState<string>("bottom_right");
  const [primaryColor, setPrimaryColor] = useState<string>("#2563eb");
  const [iconUrl, setIconUrl] = useState<string>("");
  const [offsetX, setOffsetX] = useState<number>(20);
  const [offsetY, setOffsetY] = useState<number>(50);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [iconFileName, setIconFileName] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      if (!u || u.role !== "super_admin") {
        router.replace("/admin/dashboard");
        return;
      }
    } catch {
      router.replace("/admin/dashboard");
      return;
    }
    fetchWebsites();
  }, [router]);

  const fetchWebsites = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/websites", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setWebsites(data);
        if (data.length > 0) {
          const w = data[0];
          setSelectedId(w.id);
          const s = w.settings || {};
          setPosition(s.position || "bottom_right");
          setPrimaryColor(s.primary_color || "#2563eb");
          try {
            const custom = s.custom_css ? JSON.parse(s.custom_css) : {};
            setIconUrl(custom.iconUrl || "");
            setOffsetX(
              typeof custom.offsetX === "number" ? custom.offsetX : 20,
            );
            setOffsetY(
              typeof custom.offsetY === "number" ? custom.offsetY : 50,
            );
          } catch {
            setIconUrl("");
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
    setPosition(s.position || "bottom_right");
    setPrimaryColor(s.primary_color || "#2563eb");
    try {
      const custom = s.custom_css ? JSON.parse(s.custom_css) : {};
      setIconUrl(custom.iconUrl || "");
      setOffsetX(typeof custom.offsetX === "number" ? custom.offsetX : 20);
      setOffsetY(typeof custom.offsetY === "number" ? custom.offsetY : 50);
    } catch {
      setIconUrl("");
      setOffsetX(20);
      setOffsetY(50);
    }
  };

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/widget/icon/upload", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const d = await res.json();
        setIconUrl(d.url);
      } else {
        setError("Upload Failed");
      }
    } catch {
      setError("Upload Failed");
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/websites/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
    <div
      className={`space-y-8 bg-background min-h-[calc(100vh-64px)] p-6 md:p-12 text-foreground relative ${display.className} selection:bg-foreground selection:text-background`}
    >
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col justify-between py-12 opacity-[0.03] dark:opacity-[0.05]">
        <div className="h-px w-full bg-foreground"></div>
        <div className="h-px w-full bg-foreground"></div>
        <div className="h-px w-full bg-foreground hidden md:block"></div>
        <div className="h-px w-full bg-foreground hidden lg:block"></div>
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-foreground pb-8 mb-12 gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none">
              Config_
            </h1>
            <p
              className={`text-lg md:text-xl font-bold uppercase tracking-widest bg-foreground text-background inline-flex items-center gap-2 px-3 py-1 mt-2 w-fit ${mono.className}`}
            >
              <Sliders className="w-5 h-5" /> Module Parameters
            </p>
          </div>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className={`flex mr-6 items-center gap-2 border-4 border-foreground bg-blue-500 text-white px-6 py-3 font-bold uppercase tracking-widest shadow-[6px_6px_0_0_var(--foreground)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_var(--foreground)] transition-all focus:outline-none focus:ring-4 focus:ring-foreground/20 active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[6px_6px_0_0_var(--foreground)] ${mono.className}`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {saving ? "Writing..." : "Commit Changes"}
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

        <div className="relative z-10 flex flex-col gap-8">
          <div className="border-4 border-foreground bg-background p-6 shadow-[8px_8px_0_0_currentColor]">
            <label
              className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-4 opacity-70 ${mono.className}`}
            >
              <Globe className="w-4 h-4" /> Target Domain Instance
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSelectWebsite(e.target.value)}
              className={`w-full border-4 border-foreground bg-background p-4 font-bold md:text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all uppercase tracking-widest cursor-pointer appearance-none ${mono.className}`}
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} [{w.domain}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] flex flex-col">
              <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
                <h2
                  className={`font-bold uppercase tracking-widest flex items-center gap-2 text-sm ${mono.className}`}
                >
                  <Sliders className="w-4 h-4" /> Visual Identity
                </h2>
              </div>

              <div className="p-8 flex flex-col gap-8">
                <div>
                  <label
                    className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-4 opacity-70 ${mono.className}`}
                  >
                    Brand Avatar
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 border-4 border-foreground bg-foreground/5 shadow-[4px_4px_0_0_currentColor] overflow-hidden flex items-center justify-center shrink-0">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt="Widget Icon"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Globe className="w-10 h-10 opacity-20" />
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <label
                        className={`inline-flex items-center justify-center gap-2 border-4 border-foreground bg-background px-4 py-2 font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_currentColor] transition-all cursor-pointer ${mono.className}`}
                      >
                        <Upload className="w-4 h-4" /> Upload Asset
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIconFileName(e.target.files[0].name);
                              handleUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {iconUrl && (
                        <button
                          onClick={async () => {
                            setIconUrl("");
                            await handleSave();
                          }}
                          className={`inline-flex items-center justify-center gap-2 border-4 border-red-500 text-red-600 bg-red-500/10 px-4 py-2 font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0_0_#ef4444] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_#ef4444] transition-all cursor-pointer ${mono.className}`}
                        >
                          <Trash2 className="w-3 h-3" /> Purge Asset
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t-4 border-foreground pt-6">
                  <label
                    className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-4 opacity-70 ${mono.className}`}
                  >
                    <PaintBucket className="w-4 h-4" /> Primary Base Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-16 p-1 border-4 border-foreground bg-background shadow-[4px_4px_0_0_currentColor] cursor-pointer"
                    />
                    <div
                      className={`font-bold text-xl uppercase tracking-widest ${mono.className}`}
                    >
                      {primaryColor}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] flex flex-col">
              <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
                <h2
                  className={`font-bold uppercase tracking-widest flex items-center gap-2 text-sm ${mono.className}`}
                >
                  <Crosshair className="w-4 h-4" /> Viewport Placement
                </h2>
              </div>

              <div className="p-8 flex flex-col gap-8">
                <div>
                  <label
                    className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-4 opacity-70 ${mono.className}`}
                  >
                    Mount Point
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`border-4 border-foreground p-4 flex items-center justify-center font-bold uppercase tracking-widest cursor-pointer transition-all ${position === "bottom_left" || position === "bottom-left" ? "bg-foreground text-background shadow-none translate-y-1 translate-x-1" : "bg-background shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_currentColor]"} ${mono.className}`}
                    >
                      <input
                        type="radio"
                        name="position"
                        value="bottom_left"
                        checked={
                          position === "bottom_left" ||
                          position === "bottom-left"
                        }
                        onChange={(e) => setPosition(e.target.value)}
                        className="hidden"
                      />
                      Bottom-Left
                    </label>
                    <label
                      className={`border-4 border-foreground p-4 flex items-center justify-center font-bold uppercase tracking-widest cursor-pointer transition-all ${position === "bottom_right" || position === "bottom-right" ? "bg-foreground text-background shadow-none translate-y-1 translate-x-1" : "bg-background shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_currentColor]"} ${mono.className}`}
                    >
                      <input
                        type="radio"
                        name="position"
                        value="bottom_right"
                        checked={
                          position === "bottom_right" ||
                          position === "bottom-right"
                        }
                        onChange={(e) => setPosition(e.target.value)}
                        className="hidden"
                      />
                      Bottom-Right
                    </label>
                  </div>
                </div>

                <div className="border-t-4 border-foreground pt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70 ${mono.className}`}
                    >
                      Offset X [px]
                    </label>
                    <input
                      value={offsetX}
                      onChange={(e) =>
                        setOffsetX(parseInt(e.target.value || "0", 10))
                      }
                      type="number"
                      className={`w-full border-4 border-foreground bg-background p-4 font-bold text-xl text-center shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all ${mono.className}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70 ${mono.className}`}
                    >
                      Offset Y [px]
                    </label>
                    <input
                      value={offsetY}
                      onChange={(e) =>
                        setOffsetY(parseInt(e.target.value || "0", 10))
                      }
                      type="number"
                      className={`w-full border-4 border-foreground bg-background p-4 font-bold text-xl text-center shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all ${mono.className}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
