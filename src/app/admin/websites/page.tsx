"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Plus,
  Link as LinkIcon,
  Key,
  Activity,
  Trash2,
  X,
} from "lucide-react";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ name: "", domain: "" });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/websites", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setWebsites(await res.json());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/websites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newWebsite),
    });

    if (res.ok) {
      setShowModal(false);
      setNewWebsite({ name: "", domain: "" });
      fetchWebsites();
    }
  };

  return (
    <div className={`space-y-8 relative ${display.className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-foreground pb-8 mb-8 gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none">
            Domains_
          </h1>
          <p
            className={`text-lg md:text-xl font-bold uppercase tracking-widest bg-foreground text-background inline-flex items-center gap-2 px-3 py-1 mt-2 w-fit ${mono.className}`}
          >
            <Globe className="w-5 h-5" /> Registered Sites
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`flex mr-6 items-center gap-2 border-4 border-foreground bg-blue-500 text-white px-6 py-3 font-bold uppercase tracking-widest shadow-[6px_6px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_currentColor] transition-all focus:outline-none focus:ring-4 focus:ring-foreground/20 active:translate-y-1 active:translate-x-1 active:shadow-none ${mono.className}`}
        >
          <Plus className="w-5 h-5" /> New Domain
        </button>
      </div>

      {/* Websites Grid */}
      {websites.length === 0 ? (
        <div className="border-4 border-dashed border-foreground p-12 flex flex-col items-center justify-center text-center bg-foreground/5">
          <Globe className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">
            No Domains Registered
          </h3>
          <p className={`opacity-70 ${mono.className}`}>
            Add a domain to generate an API key and start using the widget.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {websites.map((website) => (
            <div
              key={website.id}
              className="border-4 border-foreground bg-background shadow-[8px_8px_0_0_currentColor] flex flex-col group hover:-translate-y-1 hover:shadow-[12px_12px_0_0_currentColor] transition-all relative overflow-hidden"
            >
              {/* Accent Bar */}
              <div
                className={`absolute top-0 left-0 bottom-0 w-2 ${website.is_active ? "bg-green-500" : "bg-red-500"}`}
              />

              <div className="p-6 pl-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-extrabold uppercase tracking-tight break-all">
                      {website.name}
                    </h2>
                    <div
                      className={`flex items-center gap-2 text-sm font-bold opacity-70 mt-1 uppercase tracking-widest ${mono.className}`}
                    >
                      <LinkIcon className="w-4 h-4" /> {website.domain}
                    </div>
                  </div>
                  <div
                    className={`shrink-0 px-3 py-1 border-2 border-foreground font-bold uppercase tracking-widest text-xs flex items-center gap-2 ${website.is_active ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"} ${mono.className}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${website.is_active ? "bg-green-500" : "bg-red-500"}`}
                    />
                    {website.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div
                  className="mt-auto bg-foreground/5 border-2 border-foreground p-4 relative group/key cursor-pointer hover:bg-foreground hover:text-background transition-colors"
                  onClick={() => navigator.clipboard.writeText(website.api_key)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1 opacity-70 group-hover/key:text-background ${mono.className}`}
                    >
                      <Key className="w-3 h-3" /> API Key
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-widest group-hover/key:opacity-100 opacity-0 transition-opacity ${mono.className}`}
                    >
                      Click to Copy
                    </span>
                  </div>
                  <code
                    className={`font-mono text-sm break-all font-bold ${mono.className}`}
                  >
                    {website.api_key}
                  </code>
                </div>
              </div>

              <div className="border-t-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center group-hover:bg-background group-hover:text-foreground transition-colors">
                <div
                  className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${mono.className}`}
                >
                  <Activity className="w-4 h-4" /> ID:{" "}
                  {website.id.split("-")[0]}
                </div>
                <button className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform hidden">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-lg border-4 border-foreground bg-background shadow-[16px_16px_0_0_currentColor] flex flex-col">
            <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-5 h-5" /> Initialize Domain
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:scale-110 transition-transform"
              >
                <X className="w-6 h-6 border-2 border-background" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8">
              <div className="space-y-6">
                <div>
                  <label
                    className={`block text-sm font-bold uppercase tracking-widest mb-2 ${mono.className}`}
                  >
                    Project Identification
                  </label>
                  <input
                    className={`w-full border-4 border-foreground bg-background p-4 font-bold text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                    placeholder="e.g. Production Site"
                    value={newWebsite.name}
                    onChange={(e) =>
                      setNewWebsite({ ...newWebsite, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-bold uppercase tracking-widest mb-2 ${mono.className}`}
                  >
                    Domain Name
                  </label>
                  <input
                    className={`w-full border-4 border-foreground bg-background p-4 font-bold text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                    placeholder="example.com"
                    value={newWebsite.domain}
                    onChange={(e) =>
                      setNewWebsite({ ...newWebsite, domain: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 border-4 border-foreground bg-background px-6 py-4 font-bold uppercase tracking-widest shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_currentColor] transition-all ${mono.className}`}
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className={`flex-2 border-4 border-foreground bg-foreground text-background px-6 py-4 font-bold uppercase tracking-widest shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_currentColor] transition-all ${mono.className}`}
                >
                  Execute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
