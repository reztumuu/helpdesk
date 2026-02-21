'use client';

import RealtimeAlarm from '@/components/RealtimeAlarm';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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
    <div>
      <RealtimeAlarm />
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Visitors</h3>
          <p className="text-3xl font-bold mt-2">{visitors}</p>
          <span className="text-green-500 text-sm">↑ real-time</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Active Chats</h3>
          <p className="text-3xl font-bold mt-2">{activeChats}</p>
          <span className="text-blue-500 text-sm">real-time</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Conversations</h3>
          <p className="text-3xl font-bold mt-2">{totalConversations}</p>
          <span className="text-gray-500 text-sm">Last 30 days (real-time)</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Avg Response Time</h3>
          <p className="text-3xl font-bold mt-2">2m 30s</p>
          <span className="text-green-500 text-sm">↓ 15s from last week</span>
        </div>
      </div>
    </div>
  );
}
