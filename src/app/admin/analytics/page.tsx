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
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>
      <p>Realtime summary.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Visitors</h3>
          <p className="text-3xl font-bold mt-2">{visitors}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Active Chats</h3>
          <p className="text-3xl font-bold mt-2">{activeChats}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Conversations (30d)</h3>
          <p className="text-3xl font-bold mt-2">{totalConversations}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-700 font-medium mb-3">Visitor Trends (7 days)</h3>
              <SimpleLineChart labels={visitorLabels} data={visitorData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-700 font-medium mb-3">Avg Response Time (seconds)</h3>
              <SimpleBarChart labels={respLabels} data={respData} />
          </div>
      </div>
    </div>
  );
}
