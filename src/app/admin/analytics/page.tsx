"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SimpleLineChart from "@/components/SimpleLineChart";
import SimpleBarChart from "@/components/SimpleBarChart";
import {
  BarChart3,
  Activity,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function AnalyticsPage() {
  const [visitors, setVisitors] = useState<number>(0);
  const [activeChats, setActiveChats] = useState<number>(0);
  const [totalConversations, setTotalConversations] = useState<number>(0);

  const [visitorLabels, setVisitorLabels] = useState<string[]>([]);
  const [visitorData, setVisitorData] = useState<number[]>([]);
  const [respLabels, setRespLabels] = useState<string[]>([]);
  const [respData, setRespData] = useState<number[]>([]);

  const fetchCounts = async () => {
    try {
      const res = await fetch("/api/analytics/summary");
      if (res.ok) {
        const d = await res.json();
        setVisitors(d.totals?.visitors ?? 0);
        setActiveChats(d.totals?.activeChats ?? 0);
        setTotalConversations(d.totals?.conversations30d ?? 0);
        setVisitorLabels(d.visitorsTrend?.labels ?? []);
        setVisitorData(d.visitorsTrend?.counts ?? []);
        setRespLabels(d.responseTime?.labels ?? []);
        setRespData(d.responseTime?.seconds ?? []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchCounts();
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
    s.on("visitor-online", fetchCounts);
    s.on("chat-started", fetchCounts);
    s.on("new-message", fetchCounts);
    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <div className={`space-y-8 relative ${display.className}`}>
      {/* Structural Lines Background */}
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col justify-between py-12 opacity-[0.03] dark:opacity-[0.05]">
        <div className="h-px w-full bg-foreground"></div>
        <div className="h-px w-full bg-foreground"></div>
        <div className="h-px w-full bg-foreground hidden md:block"></div>
        <div className="h-px w-full bg-foreground hidden lg:block"></div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-foreground pb-8 mb-8 gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none">
            Telemetry_
          </h1>
          <p
            className={`text-lg md:text-xl font-bold uppercase tracking-widest bg-foreground text-background inline-flex items-center gap-2 px-3 py-1 mt-2 w-fit ${mono.className}`}
          >
            <BarChart3 className="w-5 h-5" /> Data & Insights
          </p>
        </div>

        <div className="flex mr-6 items-center gap-4 border-4 border-foreground p-2 bg-background shadow-[4px_4px_0_0_currentColor]">
          <div
            className={`text-xs font-bold uppercase tracking-widest px-2 ${mono.className} flex flex-col items-end`}
          >
            <span className="opacity-70">Status</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse border border-green-700" />{" "}
              SYNCED
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                className={`text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest flex items-center gap-1 border-2 border-green-600 dark:border-green-500 px-2 py-0.5 bg-green-500/10 ${mono.className}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                Realtime
              </span>
            </div>
          </div>

          <div className="border-4 border-foreground bg-background p-6 shadow-[8px_8px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[12px_12px_0_0_currentColor] transition-all group">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-4">
              <h3
                className={`text-sm font-bold uppercase tracking-widest ${mono.className}`}
              >
                Active Sessions
              </h3>
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-purple-500/10 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-6xl font-extrabold tabular-nums tracking-tighter">
                {activeChats}
              </p>
              <span
                className={`text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest flex items-center gap-1 border-2 border-green-600 dark:border-green-500 px-2 py-0.5 bg-green-500/10 ${mono.className}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                Realtime
              </span>
            </div>
          </div>

          <div className="border-4 border-foreground bg-foreground text-background p-6 shadow-[8px_8px_0_0_currentColor] hover:-translate-y-1 hover:shadow-[12px_12px_0_0_currentColor] transition-all group">
            <div className="flex items-center justify-between border-b-2 border-background pb-4 mb-4">
              <h3
                className={`text-sm font-bold uppercase tracking-widest ${mono.className}`}
              >
                Total Comms
              </h3>
              <div className="w-10 h-10 border-2 border-background flex items-center justify-center bg-background/10 group-hover:bg-background group-hover:text-foreground transition-colors">
                <MessageSquare className="w-5 h-5 group-hover:text-foreground" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-6xl font-extrabold tabular-nums tracking-tighter">
                {totalConversations}
              </p>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border-2 border-background px-2 py-0.5 opacity-80 ${mono.className}`}
              >
                30 Days
              </span>
            </div>
          </div>
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] flex flex-col">
            <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
              <h3
                className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${mono.className}`}
              >
                <TrendingUp className="w-4 h-4" /> Traffic Analysis (7D)
              </h3>
            </div>
            <div className="p-6 md:p-8 flex-1 relative bg-[linear-gradient(45deg,transparent_25%,rgba(150,150,150,0.05)_25%,rgba(150,150,150,0.05)_50%,transparent_50%,transparent_75%,rgba(150,150,150,0.05)_75%,rgba(150,150,150,0.05)_100%)] bg-size-[20px_20px]">
              <div className="relative z-10 bg-background/80 backdrop-blur-sm border-2 border-foreground p-4">
                <SimpleLineChart labels={visitorLabels} data={visitorData} />
              </div>
            </div>
          </div>

          <div className="border-4 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] flex flex-col">
            <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
              <h3
                className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${mono.className}`}
              >
                <Clock className="w-4 h-4" /> Latency Metrics (Seconds)
              </h3>
            </div>
            <div className="p-6 md:p-8 flex-1 relative bg-[linear-gradient(45deg,transparent_25%,rgba(150,150,150,0.05)_25%,rgba(150,150,150,0.05)_50%,transparent_50%,transparent_75%,rgba(150,150,150,0.05)_75%,rgba(150,150,150,0.05)_100%)] bg-size-[20px_20px]">
              <div className="relative z-10 bg-background/80 backdrop-blur-sm border-2 border-foreground p-4">
                <SimpleBarChart labels={respLabels} data={respData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
