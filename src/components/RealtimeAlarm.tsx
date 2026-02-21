'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function RealtimeAlarm() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<any>(null);
  const playedMsgIdsRef = useRef<Set<string>>(new Set());
  const startedChatIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
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

    const play = () => {
      const a = audioRef.current;
      if (!a) return;
      a.currentTime = 0;
      a.play().catch(() => {});
    };
    const stop = () => {
      const a = audioRef.current;
      if (!a) return;
      a.pause();
      a.currentTime = 0;
    };

    s.on('new-message', (data: any) => {
      if (data?.sender === 'visitor') {
        const id = typeof data.id === 'string' ? data.id : '';
        if (id && playedMsgIdsRef.current.has(id)) return;
        if (id) playedMsgIdsRef.current.add(id);
        play();
      }
    });

    s.on('chat-started', (data: any) => {
      const cid = data?.chatId;
      if (cid && startedChatIdsRef.current.has(cid)) return;
      if (cid) startedChatIdsRef.current.add(cid);
      play();
    });
    
    const recompute = () => {
      const map = JSON.parse(localStorage.getItem('unread_counts') || '{}') as Record<string, number>;
      const total = Object.values(map).reduce((a: number, b: number) => a + b, 0);
      if (total <= 0) stop();
    };
    window.addEventListener('helpdesk-unread-updated', recompute as any);
    window.addEventListener('helpdesk-alarm-stop', stop as any);

    return () => {
      s.disconnect();
      window.removeEventListener('helpdesk-unread-updated', recompute as any);
      window.removeEventListener('helpdesk-alarm-stop', stop as any);
    };
  }, []);

  return <audio ref={audioRef} src="/sound/alarem.wav" preload="auto" />;
}
