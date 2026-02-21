'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SimpleLineChart from '@/components/SimpleLineChart';
import SimpleBarChart from '@/components/SimpleBarChart';

export default function AnalyticsPage() {
  const [visitors, setVisitors] = useState<number>(0);
  const [activeChats, setActiveChats] = useState<number>(0);
  const [totalConversations, setTotalConversations] = useState<number>(0);
  
  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/analytics/summary');
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
  
  const [visitorLabels, setVisitorLabels] = useState<string[]>([]);
  const [visitorData, setVisitorData] = useState<number[]>([]);
  const [respLabels, setRespLabels] = useState<string[]>([]);
  const [respData, setRespData] = useState<number[]>([]);
  
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
      <div className="mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="px-6 py-6 sm:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-white/80 text-sm sm:text-base">Ringkasan data realtime dan tren performa.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <h3 className="text-gray-500 text-sm font-medium">Conversations (30d)</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">30 hari</span>
          </div>
          <p className="text-3xl font-bold mt-2">{totalConversations}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-700 font-medium mb-3">Visitor Trends (7 days)</h3>
          <SimpleLineChart labels={visitorLabels} data={visitorData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-700 font-medium mb-3">Avg Response Time (seconds)</h3>
          <SimpleBarChart labels={respLabels} data={respData} />
        </div>
      </div>
    </div>
  );
}
