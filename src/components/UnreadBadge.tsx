'use client';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const STORAGE_KEY = 'unread_counts';

function readCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCounts(map: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export default function UnreadBadge() {
  const [total, setTotal] = useState<number>(0);
  const socketRef = useRef<any>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setTotal(Object.values(readCounts()).reduce((a, b) => a + b, 0));

    const s = io('http://localhost:3000');
    socketRef.current = s;

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

    s.on('new-message', (data: any) => {
      if (data?.sender !== 'visitor') return;
      const id = typeof data.id === 'string' ? data.id : '';
      if (id && processedIdsRef.current.has(id)) return;
      if (id) processedIdsRef.current.add(id);
      const map = readCounts();
      const cid = data.chatId;
      map[cid] = (map[cid] || 0) + 1;
      writeCounts(map);
      setTotal(Object.values(map).reduce((a, b) => a + b, 0));
    });

    const recompute = () => {
      setTotal(Object.values(readCounts()).reduce((a, b) => a + b, 0));
    };
    window.addEventListener('storage', recompute);
    window.addEventListener('helpdesk-unread-updated', recompute as any);

    return () => {
      s.disconnect();
      window.removeEventListener('storage', recompute as any);
      window.removeEventListener('helpdesk-unread-updated', recompute as any);
    };
  }, []);

  if (!total || total <= 0) return null;

  return (
    <span className="ml-auto inline-flex items-center justify-center bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] leading-[18px] px-1.5 rounded-full">
      {total}
    </span>
  );
}
