"use client";

import RealtimeAlarm from "@/components/RealtimeAlarm";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Users, MessageSquare, Activity, Clock, Terminal } from "lucide-react";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<number>(0);
  const [activeChats, setActiveChats] = useState<number>(0);
  const [totalConversations, setTotalConversations] = useState<number>(0);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const vres = await fetch("/api/visitors?count=true", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (vres.ok) {
        const vd = await vres.json();
        setVisitors(vd.total ?? 0);
      }
      const cres = await fetch("/api/chats", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (cres.ok) {
        const chats = await cres.json();
        const active = chats.filter(
          (c: any) => c.status === "waiting" || c.status === "ongoing",
        ).length;
        setActiveChats(active);
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const total30d = chats.filter(
          (c: any) => new Date(c.created_at).getTime() >= cutoff,
        ).length;
        setTotalConversations(total30d);
      }
    } catch {}
  };
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/logs?limit=25", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const sorted = Array.isArray(data)
          ? data.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
          : [];
        setLogs(sorted);
      }
    } catch {}
  };

  useEffect(() => {
    fetchCounts();
    fetchLogs();
    const s = io("http://localhost:3000");
    const joinAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/websites", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const sites = await res.json();
          sites.forEach((w: any) => {
            if (w.api_key) s.emit("join-website", { apiKey: w.api_key });
          });
          s.on("connect", () => {
            sites.forEach((w: any) => {
              if (w.api_key) s.emit("join-website", { apiKey: w.api_key });
            });
          });
        }
      } catch {}
    };
    joinAll();
    s.on("visitor-online", () => {
      fetchCounts();
      fetchLogs();
    });
    s.on("chat-started", () => {
      fetchCounts();
      fetchLogs();
    });
    s.on("new-message", () => {
      fetchCounts();
      fetchLogs();
    });
    s.on("chat-joined", () => {
      fetchCounts();
      fetchLogs();
    });
    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <div
      className={`space-y-8 bg-background min-h-[calc(100vh-64px)] p-6 md:p-12 text-foreground relative ${display.className} selection:bg-foreground selection:text-background`}
    >
      {/* Background Structural Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col justify-between py-12 opacity-[0.03] dark:opacity-[0.05]">
        <div className="h-px w-full bg-foreground"></div>
        <div className="h-px w-full bg-foreground"></div>
        <div className="h-px w-full bg-foreground hidden md:block"></div>
        <div className="h-px w-full bg-foreground hidden lg:block"></div>
      </div>

      <RealtimeAlarm />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-foreground pb-8 mb-12 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none whitespace-nowrap">
              Command Center_
            </h1>
            <p
              className={`text-lg md:text-xl font-bold uppercase tracking-widest bg-foreground text-background inline-block px-3 py-1 mt-2 w-fit ${mono.className}`}
            >
              System Overview
            </p>
          </div>
          <div className="flex items-center gap-4 border-2 border-foreground p-2 bg-background shadow-[4px_4px_0_0_currentColor]">
            <div
              className={`text-xs font-bold uppercase tracking-widest px-2 ${mono.className} flex items-center gap-2`}
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse border border-green-700" />
              Live
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="border-4 border-foreground bg-background p-6 shadow-[8px_8px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[12px_12px_0_0_currentColor] transition-all group">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-4">
              <h3
                className={`text-sm font-bold uppercase tracking-widest ${mono.className}`}
              >
                Live Visitors
              </h3>
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-6xl font-extrabold tabular-nums tracking-tighter">
                {visitors}
              </p>
              <span
                className={`text-sm font-bold text-green-600 dark:text-green-500 uppercase tracking-widest flex items-center gap-1 ${mono.className}`}
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse border border-green-700" />
                Active
              </span>
            </div>
          </div>

          <div className="border-4 border-foreground bg-background p-6 shadow-[8px_8px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[12px_12px_0_0_currentColor] transition-all group">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-4">
              <h3
                className={`text-sm font-bold uppercase tracking-widest ${mono.className}`}
              >
                Active Chats
              </h3>
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-purple-500/10 group-hover:bg-purple-500 group-hover:text-foreground transition-colors">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-6xl font-extrabold tabular-nums tracking-tighter">
                {activeChats}
              </p>
              <span
                className={`text-sm font-bold text-green-400 uppercase tracking-widest flex items-center gap-1 ${mono.className}`}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse border border-green-600" />
                Active
              </span>
            </div>
          </div>

          <div className="border-4 border-foreground bg-background p-6 shadow-[8px_8px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[12px_12px_0_0_currentColor] transition-all group">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-4">
              <h3
                className={`text-sm font-bold uppercase tracking-widest ${mono.className}`}
              >
                Total Convos
              </h3>
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-orange-500/10 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-6xl font-extrabold tabular-nums tracking-tighter">
                {totalConversations}
              </p>
              <span
                className={`text-sm font-bold opacity-60 uppercase tracking-widest ${mono.className}`}
              >
                [30D]
              </span>
            </div>
          </div>

          <div className="border-4 border-foreground bg-background p-6 shadow-[8px_8px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[12px_12px_0_0_currentColor] transition-all group">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-4">
              <h3
                className={`text-sm font-bold uppercase tracking-widest ${mono.className}`}
              >
                Avg Response
              </h3>
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-green-500/10 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-5xl font-extrabold tabular-nums tracking-tighter">
                2m 30s
              </p>
              <span
                className={`text-sm font-bold opacity-60 uppercase tracking-widest ${mono.className}`}
              >
                [Global]
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] flex flex-col h-[500px]">
            <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
              <div
                className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${mono.className}`}
              >
                <Activity className="w-4 h-4" /> Activity Matrix
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.05)_75%,rgba(0,0,0,0.05)_100%)] dark:bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02)_100%)] bg-size-[20px_20px]">
              <div
                className={`border-2 border-foreground bg-background px-6 py-4 font-bold uppercase tracking-widest shadow-[4px_4px_0_0_currentColor] ${mono.className}`}
              >
                Chart Visualization Offline
              </div>
            </div>
          </div>

          <div className="border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] flex flex-col h-[500px]">
            <div className="border-b-4 border-foreground bg-background p-4 flex justify-between items-center">
              <div
                className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${mono.className}`}
              >
                <Terminal className="w-4 h-4" /> System Logs
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {logs.map((l) => {
                const t = new Date(l.created_at);
                const diffMs = Date.now() - t.getTime();
                const mins = Math.floor(diffMs / 60000);
                const hrs = Math.floor(mins / 60);
                const time = hrs >= 1 ? `${hrs} hr${hrs > 1 ? "s" : ""} ago` : `${mins} mins ago`;
                const type =
                  l.action === "chat_joined"
                    ? "success"
                    : l.action === "visitor_online"
                    ? "info"
                    : l.action === "message_posted"
                    ? "info"
                    : l.action === "chat_started"
                    ? "info"
                    : "info";
                let text = l.action;
                if (l.action === "chat_joined") {
                  text = `Chat joined by ${l.metadata?.assigneeName || "Agent"}`;
                } else if (l.action === "visitor_online") {
                  text = "New visitor online";
                } else if (l.action === "message_posted") {
                  const sender = l.metadata?.sender || "";
                  const short = (l.resource_id || "").slice(0, 6);
                  text = `Message by ${sender} in chat ${short}`;
                } else if (l.action === "chat_started") {
                  const short = (l.resource_id || "").slice(0, 6);
                  text = `Chat ${short} started`;
                }
                return (
                  <div
                    key={l.id}
                    className={`flex gap-4 items-start border-l-4 ${
                      type === "success" ? "border-green-500" : "border-blue-500"
                    } pl-4`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold uppercase tracking-tight text-lg leading-tight">
                        {text}
                      </span>
                      <span
                        className={`text-xs opacity-60 font-bold uppercase tracking-widest mt-1 ${mono.className}`}
                      >
                        {time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
