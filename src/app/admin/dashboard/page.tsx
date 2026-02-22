'use client';

import RealtimeAlarm from '@/components/RealtimeAlarm';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Users, MessageSquare, Activity, Clock } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<number>(0);
  const [activeChats, setActiveChats] = useState<number>(0);
  const [totalConversations, setTotalConversations] = useState<number>(0);
  
  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const vres = await fetch('/api/visitors?count=true', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (vres.ok) {
        const vd = await vres.json();
        setVisitors(vd.total ?? 0);
      }
      const cres = await fetch('/api/chats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (cres.ok) {
        const chats = await cres.json();
        const active = chats.filter((c: any) => c.status === 'waiting' || c.status === 'ongoing').length;
        setActiveChats(active);
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const total30d = chats.filter((c: any) => new Date(c.created_at).getTime() >= cutoff).length;
        setTotalConversations(total30d);
      }
    } catch {}
  };
  
  useEffect(() => {
    fetchCounts();
    const s = io('http://localhost:3000');
    const joinAll = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/websites', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const sites = await res.json();
          sites.forEach((w: any) => {
            if (w.api_key) s.emit('join-website', { apiKey: w.api_key });
          });
          s.on('connect', () => {
            sites.forEach((w: any) => {
              if (w.api_key) s.emit('join-website', { apiKey: w.api_key });
            });
          });
        }
      } catch {}
    };
    joinAll();
    s.on('visitor-online', fetchCounts);
    s.on('chat-started', fetchCounts);
    s.on('new-message', fetchCounts);
    return () => {
      s.disconnect();
    };
  }, []);
  
  return (
    <div className="space-y-8 bg-background min-h-screen p-8 text-foreground">
      <RealtimeAlarm />
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-border pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of system performance and visitor activity.</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Live Visitors</h3>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground tabular-nums">{visitors}</p>
            <span className="text-xs text-green-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Chats</h3>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground tabular-nums">{activeChats}</p>
             <span className="text-xs text-green-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Conversations</h3>
            <Activity className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground tabular-nums">{totalConversations}</p>
            <span className="text-xs text-muted-foreground font-mono">30 days</span>
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Response Time</h3>
            <Clock className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground tabular-nums">2m 30s</p>
            <span className="text-xs text-muted-foreground font-mono">Global Avg</span>
          </div>
        </Card>
      </div>

      {/* Placeholder for Chart/Activity Section */}
      <div className="grid lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2">
            <Card className="h-[400px] p-6 bg-card border border-dashed border-border flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Activity Chart Placeholder</p>
            </Card>
        </div>
        <div>
             <Card className="h-[400px] p-6 bg-card border border-border flex flex-col gap-4">
                <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex gap-3 items-start text-sm">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                            <div>
                                <p className="text-foreground">New visitor on Pricing Page</p>
                                <p className="text-xs text-muted-foreground">2 mins ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
