'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send, MessagesSquare } from 'lucide-react';

export default function WidgetPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unread, setUnread] = useState(0);
  const chatIdRef = useRef<string | null>(null);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [typingDots, setTypingDots] = useState('.');
  const typingStopTimerRef = useRef<any>(null);
  const typingDotsTimerRef = useRef<any>(null);
  const [assigneeName, setAssigneeName] = useState<string>('');
  const [iconFailed, setIconFailed] = useState(false);
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  const [iconReady, setIconReady] = useState(false);
  const heartbeatRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedMsgIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Get apiKey from URL
    const params = new URLSearchParams(window.location.search);
    const key = params.get('apiKey');
    if (key) {
        setApiKey(key);
        fetchConfig(key);
    }
  }, []);

  const fetchConfig = async (key: string) => {
      try {
        const res = await fetch(`/api/widget/config?apiKey=${key}`);
        if (res.ok) {
            const data = await res.json();
            setConfig(data);
            window.parent.postMessage({ type: 'helpdesk-config', position: data.position, offsetX: data.offsetX, offsetY: data.offsetY }, '*');
            setIconFailed(false);
            try {
              const u = data.iconUrl as string;
              if (u && typeof u === 'string' && u.length > 0) {
                const abs = /^https?:\/\//i.test(u) ? u : `${window.location.origin}${u}`;
                setIconReady(false);
                const probe = new Image();
                probe.onload = () => {
                  setIconSrc(abs);
                  setIconReady(true);
                };
                probe.onerror = () => {
                  setIconFailed(true);
                  setIconSrc(null);
                  setIconReady(false);
                };
                probe.src = abs;
              } else {
                setIconSrc(null);
                setIconReady(false);
              }
            } catch {
              setIconSrc(null);
              setIconReady(false);
            }
            
            // Connect to socket
            const newSocket = io('http://localhost:3000');
            setSocket(newSocket);
            
            newSocket.emit('join-website', { apiKey: key });
            newSocket.on('connect', () => {
              newSocket.emit('join-website', { apiKey: key });
              if (chatIdRef.current) {
                newSocket.emit('join-chat', chatIdRef.current);
              }
            });
            
            // Track visitor session (create/update)
            try {
              const storageKey = `helpdesk_session_${key}`;
              const saved = localStorage.getItem(storageKey);
              const resTrack = await fetch('/api/visitors/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saved ? { apiKey: key, sessionId: saved } : { apiKey: key })
              });
              if (resTrack.ok) {
                const t = await resTrack.json();
                localStorage.setItem(storageKey, t.sessionId);
                newSocket.emit('visitor-online', { websiteId: t.websiteId, apiKey: key, chatId });
                const savedChatId = localStorage.getItem(`helpdesk_chat_${key}`);
                if (savedChatId) {
                  setChatId(savedChatId);
                  chatIdRef.current = savedChatId;
                  newSocket.emit('join-chat', savedChatId);
                  await loadMessages(savedChatId, t.sessionId);
                  await loadAssignee(savedChatId, t.sessionId);
                }
              }
            } catch {}
            
            if (!chatId) {
              const started = await startChat(key);
              if (started) {
                setChatId(started);
                newSocket.emit('visitor-online', { websiteId: data.websiteId, apiKey: key, chatId: started });
                newSocket.emit('chat-started', { websiteId: data.websiteId, apiKey: key, chatId: started });
                try {
                  const sid = localStorage.getItem(`helpdesk_session_${key}`);
                  if (sid) await loadMessages(started, sid);
                  if (sid) await loadAssignee(started, sid);
                } catch {}
              } else {
                newSocket.emit('visitor-online', { websiteId: data.websiteId, apiKey: key });
              }
            }
            
            newSocket.on('new-message', (data: any) => {
                const belongs = !!chatIdRef.current && data.chatId === chatIdRef.current;
                if (belongs) {
                    const incoming = {
                      content: data.content,
                      sender_type: data.sender === 'admin' ? 'admin' : 'visitor',
                      created_at: data.createdAt || Date.now(),
                      id: data.id
                    };
                    setMessages(prev => {
                      if (incoming.id && prev.some((m: any) => m.id === incoming.id)) return prev;
                      return [...prev, incoming];
                    });
                    scrollToBottom();
                    setIsAdminTyping(false);
                    if (!isOpen) {
                      const id = typeof data.id === 'string' ? data.id : '';
                      if (!id || !playedMsgIdsRef.current.has(id)) {
                        if (id) playedMsgIdsRef.current.add(id);
                        setUnread((u) => u + 1);
                        if (data.sender === 'admin') {
                          const a = audioRef.current;
                          if (a) {
                            a.currentTime = 0;
                            a.play().catch(() => {});
                          }
                        }
                      }
                    }
                }
            });
            
            newSocket.on('chat-joined', (data: any) => {
              if (chatIdRef.current && data.chatId === chatIdRef.current) {
                const name = typeof data.assigneeName === 'string' ? data.assigneeName : '';
                if (name) setAssigneeName(name);
              }
            });
            
            newSocket.on('chat-ended', (data: any) => {
              if (chatIdRef.current && data.chatId === chatIdRef.current) {
                setAssigneeName('');
              }
            });
            
            newSocket.on('user-typing', (data: any) => {
              if (chatIdRef.current && data.chatId === chatIdRef.current) {
                setIsAdminTyping(true);
                if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
                typingStopTimerRef.current = setTimeout(() => setIsAdminTyping(false), 3000);
                scrollToBottom();
              }
            });
            
            newSocket.on('user-stopped-typing', (data: any) => {
              if (chatIdRef.current && data.chatId === chatIdRef.current) {
                setIsAdminTyping(false);
              }
            });
            
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            heartbeatRef.current = setInterval(async () => {
              try {
                const sid = localStorage.getItem(`helpdesk_session_${key}`);
                await fetch('/api/visitors/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ apiKey: key, sessionId: sid || undefined })
                });
                newSocket.emit('visitor-online', { websiteId: data.websiteId, apiKey: key, chatId: chatIdRef.current });
              } catch {}
            }, 15000);
            
            const off = () => {
              try {
                newSocket.emit('visitor-offline', { websiteId: data.websiteId, apiKey: key, chatId: chatIdRef.current });
              } catch {}
            };
            window.addEventListener('beforeunload', off);
            window.addEventListener('pagehide', off);
            
            return () => {
              if (heartbeatRef.current) clearInterval(heartbeatRef.current);
              window.removeEventListener('beforeunload', off);
              window.removeEventListener('pagehide', off);
            };
        }
      } catch (err) {
          console.error("Failed to load widget config", err);
      }
  };

  useEffect(() => {
      const width = isOpen ? '380px' : '80px';
      const height = isOpen ? '520px' : '80px';
      
      window.parent.postMessage({
          type: 'helpdesk-resize',
          width,
          height,
          isOpen
      }, '*');
      if (isOpen) setUnread(0);
  }, [isOpen]);

  const toggleOpen = () => {
      setIsOpen(!isOpen);
      const a = audioRef.current;
      if (a) {
        const prevMuted = a.muted;
        a.muted = true;
        a.play().then(() => {
          a.pause();
          a.currentTime = 0;
          a.muted = prevMuted;
        }).catch(() => {});
      }
  };
  
  const startChat = async (keyOverride?: string) => {
       try {
           // Include sessionId to reuse existing chat
           let sid: string | null = null;
           try {
             const storageKey = `helpdesk_session_${keyOverride ?? apiKey}`;
             sid = localStorage.getItem(storageKey);
           } catch {}
           const res = await fetch('/api/chats/start', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ apiKey: keyOverride ?? apiKey, sessionId: sid || undefined })
           });
           if (res.ok) {
               const chat = await res.json();
               setChatId(chat.id);
               try {
                 localStorage.setItem(`helpdesk_chat_${keyOverride ?? apiKey}`, chat.id);
               } catch {}
               return chat.id;
           }
       } catch (err) {
           console.error("Failed to start chat", err);
       }
       return null;
  };

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !config) return;

      let currentChatId = chatId;
      
      if (!currentChatId) {
          currentChatId = await startChat();
          if (!currentChatId) return;
          if (socket) socket.emit('join-chat', currentChatId);
      }
      
      try {
          const res = await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  chatId: currentChatId,
                  content: newMessage,
                  sender: 'visitor',
                  type: 'text'
              })
          });

          if (res.ok) {
              const msg = await res.json();
              setNewMessage('');
              scrollToBottom();
              if (socket && chatIdRef.current) {
                socket.emit('typing-stop', { chatId: chatIdRef.current });
              }
          }
      } catch (err) {
          console.error("Failed to send message", err);
      }
  };
  
  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const loadMessages = async (cid: string, sid: string) => {
    try {
      const res = await fetch(`/api/messages/visitor?chatId=${cid}&sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
      }
    } catch (e) {
      console.error('Failed to load messages history', e);
    }
  };
  
  const loadAssignee = async (cid: string, sid: string) => {
    try {
      const res = await fetch(`/api/chats/visitor?chatId=${cid}&sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        const name = data?.assignee?.name || '';
        if (name) setAssigneeName(name);
      }
    } catch {}
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socket && chatIdRef.current) {
      if (e.target.value.trim().length > 0) {
        socket.emit('typing-start', { chatId: chatIdRef.current });
      } else {
        socket.emit('typing-stop', { chatId: chatIdRef.current });
      }
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = setTimeout(() => {
        socket.emit('typing-stop', { chatId: chatIdRef.current! });
      }, 1500);
    }
  };
  
  useEffect(() => {
    chatIdRef.current = chatId;
    if (socket && chatId) {
      socket.emit('join-chat', chatId);
    }
  }, [chatId, socket]);
  
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'helpdesk-toggle') {
        setIsOpen(!!event.data.open);
      }
    };
    window.addEventListener('message', handler as any);
    return () => {
      window.removeEventListener('message', handler as any);
    };
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (isAdminTyping) {
      if (typingDotsTimerRef.current) clearInterval(typingDotsTimerRef.current);
      typingDotsTimerRef.current = setInterval(() => {
        setTypingDots(prev => (prev.length >= 3 ? '.' : prev + '.'));
      }, 400);
    } else {
      if (typingDotsTimerRef.current) clearInterval(typingDotsTimerRef.current);
      setTypingDots('.');
    }
    return () => {
      if (typingDotsTimerRef.current) clearInterval(typingDotsTimerRef.current);
    };
  }, [isAdminTyping]);

  useEffect(() => {
    if (isAdminTyping) {
      scrollToBottom();
    }
  }, [isAdminTyping]);

  return (
    <div className="h-full w-full flex flex-col bg-transparent overflow-hidden">
      <audio ref={audioRef} src="/sound/alarm.mp3" preload="auto" />
      <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .hd-no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hd-no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {isOpen ? (
        <div className="flex-1 bg-white flex flex-col shadow-xl rounded-lg overflow-hidden border">
          <div className="px-4 py-3 text-white flex justify-between items-center" style={{ backgroundColor: (config?.primary_color || '#2563eb') }}>
            <div>
              <h3 className="font-bold">Support</h3>
              <p className="text-xs opacity-90">{assigneeName ? `Agent ${assigneeName} joined` : 'We typically reply in a few minutes'}</p>
            </div>
            <button onClick={toggleOpen} className="text-white hover:opacity-80">
                <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 pt-2 pb-2 hd-no-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>{config?.welcome_message || 'How can we help?'}</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-3 flex ${msg.sender_type === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap break-words ${
                        msg.sender_type === 'visitor'
                          ? 'text-white rounded-br-none'
                          : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                      style={{
                        ...(msg.sender_type === 'visitor' ? { backgroundColor: (config?.primary_color || '#2563eb') } : {}),
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAdminTyping && (
                  <div className="mb-3 flex justify-start">
                    <div className="max-w-[50%] px-3 py-2 rounded-lg bg-white border text-gray-600 text-sm">
                      <span>Typing{typingDots}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          <form onSubmit={handleSend} className="px-3 py-2 border-t bg-white flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Send a message..."
              className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button 
                type="submit" 
                className="h-9 w-9 rounded-full text-white hover:opacity-90 flex items-center justify-center"
                style={{ backgroundColor: (config?.primary_color || '#2563eb') }}
            >
                <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex justify-end items-end h-full">
          <button
            onClick={toggleOpen}
            className="w-[80px] h-[80px] rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform relative outline-none focus:outline-none"
            style={{ backgroundColor: (config?.primary_color || '#f59e0b') }}
            aria-label="Open chat"
          >
            {iconReady && iconSrc ? (
              <img src={iconSrc} alt="" className="w-9 h-9 object-cover rounded" />
            ) : (
              <MessagesSquare size={32} className="text-white" />
            )}
            {unread > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-[12px] w-[22px] h-[22px] rounded-full inline-flex items-center justify-center shadow">
                {unread}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
