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
      <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="px-6 py-8 sm:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-white/80 text-sm sm:text-base">Ringkasan realtime untuk visitors dan percakapan.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Visitors</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">realtime</span>
          </div>
          <p className="text-3xl font-bold mt-2">{visitors}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Active Chats</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">realtime</span>
          </div>
          <p className="text-3xl font-bold mt-2">{activeChats}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Conversations</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">30 hari</span>
          </div>
          <p className="text-3xl font-bold mt-2">{totalConversations}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Avg Response Time</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">realtime</span>
          </div>
          <p className="text-3xl font-bold mt-2">2m 30s</p>
        </div>
      </div>
    </div>
  );
}
