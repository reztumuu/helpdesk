'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import RealtimeAlarm from '@/components/RealtimeAlarm';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [isTypingVisitor, setIsTypingVisitor] = useState(false);
  const [typingDots, setTypingDots] = useState('.');
  const typingStopTimerRef = useRef<any>(null);
  const typingDotsTimerRef = useRef<any>(null);

  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:3000'); // Use env var in real app
    setSocket(newSocket);

    // Initial fetch of chats
    fetchChats();
    fetchVisitorCount();

    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/websites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const sites = await res.json();
          sites.forEach((w: any) => {
            if (w.api_key) {
              newSocket.emit('join-website', { apiKey: w.api_key });
            }
          });
          newSocket.on('connect', () => {
            sites.forEach((w: any) => {
              if (w.api_key) {
                newSocket.emit('join-website', { apiKey: w.api_key });
              }
            });
            const savedId = localStorage.getItem('activeChatId');
            const targetId = savedId || activeChat?.id;
            if (targetId) {
              newSocket.emit('join-chat', targetId);
            }
          });
        }
      } catch {}
    })();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
      if (!socket) return;

      socket.on('new-message', (data: any) => {
          // If message belongs to active chat, append it
          if (activeChat && data.chatId === activeChat.id) {
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
          }
          // Also update chat list (e.g. move to top, update last message)
          setChats(prev => {
            const updated = prev.map(c => {
              if (c.id === data.chatId) {
                const msgObj = {
                  content: data.content,
                  sender_type: data.sender === 'admin' ? 'admin' : 'visitor',
                  created_at: data.createdAt || Date.now(),
                  id: data.id
                };
                return { ...c, messages: [msgObj], updated_at: new Date().toISOString() };
              }
              return c;
            });
            // Move updated chat to top
            const idx = updated.findIndex(c => c.id === data.chatId);
            if (idx > -1) {
              const item = updated.splice(idx, 1)[0];
              updated.unshift(item);
            }
            return updated;
          });
          fetchChats();
          fetchVisitorCount();
          if (!activeChat || data.chatId !== activeChat.id) {
            setUnread(prev => ({ ...prev, [data.chatId]: (prev[data.chatId] || 0) + 1 }));
          }
      });

      socket.on('visitor-online', () => {
          fetchChats();
          fetchVisitorCount();
      });
      
      socket.on('chat-started', () => {
          fetchChats();
          fetchVisitorCount();
      });
      
      socket.on('user-typing', (data: any) => {
        if (activeChat && data.chatId === activeChat.id) {
          setIsTypingVisitor(true);
          if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
          typingStopTimerRef.current = setTimeout(() => setIsTypingVisitor(false), 3000);
        }
      });
      
      socket.on('user-stopped-typing', (data: any) => {
        if (activeChat && data.chatId === activeChat.id) {
          setIsTypingVisitor(false);
        }
      });

      return () => {
          socket.off('new-message');
          socket.off('visitor-online');
          socket.off('chat-started');
          socket.off('user-typing');
          socket.off('user-stopped-typing');
      };
  }, [socket, activeChat]);

  const fetchChats = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/chats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setChats(data);
      try {
        const savedId = localStorage.getItem('activeChatId');
        if (savedId && !activeChat) {
          const found = data.find((c: any) => c.id === savedId);
          if (found) {
            setActiveChat(found);
            if (socket) socket.emit('join-chat', savedId);
            fetchChatMessages(savedId);
          }
        }
      } catch {}
    }
  };
  
  const fetchVisitorCount = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/visitors?count=true', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setVisitorCount(data.total ?? 0);
    }
  };

  const handleSelectChat = (chat: any) => {
      setActiveChat(chat);
      fetchChatMessages(chat.id);
      // Join chat room if needed, but here we listen to all for simplicity or join on select
      if (socket) {
          socket.emit('join-chat', chat.id); 
      }
      scrollToBottom();
      setUnread(prev => {
        const next = { ...prev };
        delete next[chat.id];
        return next;
      });
      try {
        localStorage.setItem('activeChatId', chat.id);
        const raw = localStorage.getItem('unread_counts');
        const map = raw ? JSON.parse(raw) : {};
        if (map && map[chat.id]) {
          delete map[chat.id];
          localStorage.setItem('unread_counts', JSON.stringify(map));
        }
        window.dispatchEvent(new CustomEvent('helpdesk-unread-updated'));
        window.dispatchEvent(new CustomEvent('helpdesk-alarm-stop'));
      } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !activeChat) return;

      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
               Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
              chatId: activeChat.id,
              content: newMessage,
              sender: 'admin',
              type: 'text'
          })
      });

      if (res.ok) {
          const msg = await res.json();
          setNewMessage('');
          
          // Emit socket event to notify visitor
          scrollToBottom();
          setIsTypingVisitor(false);
          if (socket) {
            socket.emit('typing-stop', { chatId: activeChat.id });
          }
      }
  };

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socket && activeChat) {
      if (e.target.value.trim().length > 0) {
        socket.emit('typing-start', { chatId: activeChat.id });
      } else {
        socket.emit('typing-stop', { chatId: activeChat.id });
      }
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = setTimeout(() => {
        socket.emit('typing-stop', { chatId: activeChat.id });
      }, 1500);
    }
  };
  
  useEffect(() => {
    if (isTypingVisitor) {
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
  }, [isTypingVisitor]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchChatMessages = async (chatId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/messages?chatId=${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    } else {
      setMessages([]);
    }
  };

  return (
    <div>
      <RealtimeAlarm />
      <div className="mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="px-6 py-6 sm:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Chats</h1>
          <p className="mt-1 text-white/80 text-sm sm:text-base">Kelola percakapan visitor secara realtime.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 overflow-hidden flex flex-col h-[70vh]">
          <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-10">
            <h2 className="font-semibold">Active Chats</h2>
            <Badge variant="success" className="px-2 py-0.5">Visitors: {visitorCount}</Badge>
          </div>
          <div className="overflow-y-auto flex-1">
            {chats.map(chat => (
              <button
                type="button"
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`w-full text-left p-4 border-b hover:bg-blue-50 ${activeChat?.id === chat.id ? 'bg-blue-50' : ''} relative`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Visitor #{chat.visitor_id.slice(0, 5)}</span>
                  <span className="text-xs text-gray-500">{new Date(chat.updated_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {chat.messages[0]?.content || 'No messages'}
                </p>
                {unread[chat.id] && unread[chat.id] > 0 && (
                  <Badge variant="danger" className="absolute top-3 right-3 min-w-[18px] h-[18px] leading-[18px] text-[10px] px-1.5 flex items-center justify-center rounded-full">
                    {unread[chat.id]}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2 overflow-hidden flex flex-col h-[70vh]">
          {activeChat ? (
            <>
              <div className="p-4 border-b bg-white flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">Visitor #{activeChat.visitor_id.slice(0, 5)}</h2>
                  <span className="text-sm text-green-500">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="px-2 py-0.5">realtime</Badge>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-4 flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg whitespace-pre-wrap break-words ${
                      msg.sender_type === 'admin'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border text-gray-800 rounded-bl-none'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <span className={`text-xs block mt-1 ${msg.sender_type === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isTypingVisitor && (
                  <div className="mb-4 flex justify-start">
                    <div className="max-w-[50%] px-3 py-2 rounded-lg bg-white border text-gray-600">
                      <span>Typing{typingDots}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full"
                />
                <Button type="submit" className="rounded-full px-6">Send</Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
