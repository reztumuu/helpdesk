"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import RealtimeAlarm from "@/components/RealtimeAlarm";
import {
  MessageSquare,
  Users,
  History,
  Activity,
  Terminal,
  Send,
  TerminalSquare,
} from "lucide-react";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function ChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [isTypingVisitor, setIsTypingVisitor] = useState(false);
  const [typingDots, setTypingDots] = useState(".");
  const typingStopTimerRef = useRef<any>(null);
  const typingDotsTimerRef = useRef<any>(null);
  const [me, setMe] = useState<any>(null);
  const [tab, setTab] = useState<"chats" | "visitors">("chats");
  const [visitors, setVisitors] = useState<any[]>([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    fetchChats();
    fetchVisitorCount();

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/websites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const sites = await res.json();
          sites.forEach((w: any) => {
            if (w.api_key) {
              newSocket.emit("join-website", { apiKey: w.api_key });
            }
          });
          newSocket.on("connect", () => {
            sites.forEach((w: any) => {
              if (w.api_key) {
                newSocket.emit("join-website", { apiKey: w.api_key });
              }
            });
            const savedId = localStorage.getItem("activeChatId");
            const targetId = savedId || activeChat?.id;
            if (targetId) {
              newSocket.emit("join-chat", targetId);
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
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/profile", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setMe(data);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", (data: any) => {
      if (activeChat && data.chatId === activeChat.id) {
        const incoming = {
          content: data.content,
          sender_type: data.sender === "admin" ? "admin" : "visitor",
          created_at: data.createdAt || Date.now(),
          id: data.id,
        };
        setMessages((prev) => {
          if (incoming.id && prev.some((m: any) => m.id === incoming.id))
            return prev;
          return [...prev, incoming];
        });
        scrollToBottom();
      }
      setChats((prev) => {
        const updated = prev.map((c) => {
          if (c.id === data.chatId) {
            const msgObj = {
              content: data.content,
              sender_type: data.sender === "admin" ? "admin" : "visitor",
              created_at: data.createdAt || Date.now(),
              id: data.id,
            };
            return {
              ...c,
              messages: [msgObj],
              updated_at: new Date().toISOString(),
            };
          }
          return c;
        });
        const idx = updated.findIndex((c) => c.id === data.chatId);
        if (idx > -1) {
          const item = updated.splice(idx, 1)[0];
          updated.unshift(item);
        }
        return updated;
      });
      if (!activeChat || data.chatId !== activeChat.id) {
        setUnread((prev) => ({
          ...prev,
          [data.chatId]: (prev[data.chatId] || 0) + 1,
        }));
      }
    });

    socket.on("visitor-online", () => {
      fetchVisitorCount();
      fetchVisitorsOnline();
    });

    socket.on("chat-started", () => {
      fetchChats();
      fetchVisitorCount();
      fetchVisitorsOnline();
    });
    
    socket.on("visitor-offline", () => {
      fetchVisitorsOnline();
      fetchVisitorCount();
    });

    socket.on("chat-joined", (data: any) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === data.chatId
            ? {
                ...c,
                assigned_to: data.assigneeId,
                assignee: { id: data.assigneeId, name: data.assigneeName },
                status: "ongoing",
                updated_at: new Date().toISOString(),
              }
            : c,
        ),
      );
      if (activeChat && data.chatId === activeChat.id) {
        setActiveChat((prev: any) =>
          prev
            ? {
                ...prev,
                assigned_to: data.assigneeId,
                assignee: { id: data.assigneeId, name: data.assigneeName },
                status: "ongoing",
              }
            : prev,
        );
      }
    });

    socket.on("user-typing", (data: any) => {
      if (activeChat && data.chatId === activeChat.id) {
        setIsTypingVisitor(true);
        if (typingStopTimerRef.current)
          clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = setTimeout(
          () => setIsTypingVisitor(false),
          3000,
        );
        scrollToBottom();
      }
    });

    socket.on("user-stopped-typing", (data: any) => {
      if (activeChat && data.chatId === activeChat.id) {
        setIsTypingVisitor(false);
      }
    });

    return () => {
      socket.off("new-message");
      socket.off("visitor-online");
      socket.off("chat-started");
      socket.off("chat-joined");
      socket.off("user-typing");
      socket.off("user-stopped-typing");
      socket.off("visitor-offline");
    };
  }, [socket, activeChat]);

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/chats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setChats(data);
      try {
        const savedId = localStorage.getItem("activeChatId");
        if (savedId && !activeChat) {
          const found = data.find((c: any) => c.id === savedId);
          if (found) {
            setActiveChat(found);
            if (socket) socket.emit("join-chat", savedId);
            fetchChatMessages(savedId);
          }
        }
      } catch {}
    }
  };

  const fetchVisitorCount = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/visitors?count=true&online=true", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setVisitorCount(data.total ?? 0);
    }
  };
  
  const fetchVisitorsOnline = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/visitors?online=true&limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setVisitors(data || []);
    }
  };

  const handleSelectChat = (chat: any) => {
    setActiveChat(chat);
    fetchChatMessages(chat.id);
    if (socket) {
      socket.emit("join-chat", chat.id);
    }
    scrollToBottom();
    setUnread((prev) => {
      const next = { ...prev };
      delete next[chat.id];
      return next;
    });
    try {
      localStorage.setItem("activeChatId", chat.id);
      const raw = localStorage.getItem("unread_counts");
      const map = raw ? JSON.parse(raw) : {};
      if (map && map[chat.id]) {
        delete map[chat.id];
        localStorage.setItem("unread_counts", JSON.stringify(map));
      }
      window.dispatchEvent(new CustomEvent("helpdesk-unread-updated"));
      window.dispatchEvent(new CustomEvent("helpdesk-alarm-stop"));
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const token = localStorage.getItem("token");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId: activeChat.id,
        content: newMessage,
        sender: "admin",
        type: "text",
      }),
    });

    if (res.ok) {
      const msg = await res.json();
      setNewMessage("");
      scrollToBottom();
      setIsTypingVisitor(false);
      if (socket) {
        socket.emit("typing-stop", { chatId: activeChat.id });
      }
    }
  };

  const handleJoinChat = async () => {
    if (!activeChat) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chats/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId: activeChat.id }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveChat(updated);
        setChats((prev) =>
          prev.map((c) =>
            c.id === updated.id ? { ...c, ...updated, messages: c.messages } : c,
          ),
        );
        if (socket) socket.emit("join-chat", updated.id);
      }
    } catch {}
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socket && activeChat) {
      if (e.target.value.trim().length > 0) {
        socket.emit("typing-start", { chatId: activeChat.id });
      } else {
        socket.emit("typing-stop", { chatId: activeChat.id });
      }
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = setTimeout(() => {
        socket.emit("typing-stop", { chatId: activeChat.id });
      }, 1500);
    }
  };

  useEffect(() => {
    if (isTypingVisitor) {
      if (typingDotsTimerRef.current) clearInterval(typingDotsTimerRef.current);
      typingDotsTimerRef.current = setInterval(() => {
        setTypingDots((prev) => (prev.length >= 3 ? "." : prev + "."));
      }, 400);
    } else {
      if (typingDotsTimerRef.current) clearInterval(typingDotsTimerRef.current);
      setTypingDots(".");
    }
    return () => {
      if (typingDotsTimerRef.current) clearInterval(typingDotsTimerRef.current);
    };
  }, [isTypingVisitor]);

  useEffect(() => {
    if (isTypingVisitor) {
      scrollToBottom();
    }
  }, [isTypingVisitor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatMessages = async (chatId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/messages?chatId=${chatId}&order=desc&limit=200`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(Array.isArray(data) ? data.reverse() : []);
    } else {
      setMessages([]);
    }
  };

  return (
    <div
      className={`space-y-8 relative h-[calc(100vh-64px)] flex flex-col ${display.className} p-4 md:p-8 overflow-hidden`}
    >
      <RealtimeAlarm />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-foreground pb-6 shrink-0 relative z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase leading-none">
            Comms_Feed
          </h1>
          <p
            className={`text-sm md:text-base font-bold uppercase tracking-widest bg-foreground text-background inline-flex items-center gap-2 px-3 py-1 mt-2 w-fit ${mono.className}`}
          >
            <MessageSquare className="w-4 h-4" /> Live Intercom
          </p>
        </div>
        <div
          className={`mt-4 md:mt-0 flex items-center gap-4 border-4 border-foreground p-3 bg-background shadow-[4px_4px_0_0_currentColor] ${mono.className}`}
        >
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">
              Visitors Online
            </span>
            <span className="text-xl font-extrabold">{visitorCount}</span>
          </div>
          <div className="w-10 h-10 border-2 border-foreground bg-green-500/10 flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse border border-green-700" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr] gap-6 flex-1 min-h-0 relative z-10 pb-4">
        <div className="border-4 border-foreground bg-background shadow-[8px_8px_0_0_currentColor] flex flex-col h-full overflow-hidden">
          <div className="border-b-4 border-foreground bg-foreground text-background p-4 flex justify-between items-center shrink-0">
            <h2
              className={`font-bold uppercase tracking-widest flex items-center gap-2 text-sm ${mono.className}`}
            >
              <History className="w-4 h-4" /> Message Logs
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("chats")}
                className={`px-3 py-1 border-2 border-background font-bold uppercase tracking-widest text-xs ${tab === "chats" ? "bg-background text-foreground" : "bg-foreground/20 text-background"}`}
              >
                Chats
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("visitors");
                  fetchVisitorsOnline();
                }}
                className={`px-3 py-1 border-2 border-background font-bold uppercase tracking-widest text-xs ${tab === "visitors" ? "bg-background text-foreground" : "bg-foreground/20 text-background"}`}
              >
                Visitors
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 bg-foreground/5">
            {tab === "visitors" ? (
              visitors.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-50">
                  <Users className="w-12 h-12 mb-4" />
                  <p className={`text-sm uppercase font-bold tracking-widest ${mono.className}`}>No Visitors Online</p>
                </div>
              ) : (
                visitors.map((v) => (
                  <div key={v.id} className="w-full text-left p-5 border-b-4 border-foreground transition-all flex flex-col gap-2 bg-background">
                    <div className="flex justify-between items-center w-full">
                      <span className={`font-bold uppercase tracking-widest text-sm flex items-center gap-2 ${mono.className}`}>
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        V_{String(v.id).slice(0, 5)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${mono.className}`}>
                        {new Date(v.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className={`text-sm truncate font-medium opacity-70 ${mono.className}`}>Session: {v.session_id}</p>
                  </div>
                ))
              )
            ) : chats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-50">
                <TerminalSquare className="w-12 h-12 mb-4" />
                <p
                  className={`text-sm uppercase font-bold tracking-widest ${mono.className}`}
                >
                  No Active Sessions
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  type="button"
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full text-left p-5 border-b-4 border-foreground transition-all flex flex-col gap-2 group outline-none focus-visible:bg-foreground focus-visible:text-background ${
                    activeChat?.id === chat.id
                      ? "bg-foreground text-background shadow-[inset_6px_0_0_0_#3b82f6] dark:shadow-[inset_6px_0_0_0_#60a5fa]"
                      : "bg-background hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span
                      className={`font-bold uppercase tracking-widest text-sm flex items-center gap-2 ${mono.className}`}
                    >
                      <Users
                        className={`w-4 h-4 ${activeChat?.id === chat.id ? "text-blue-400" : "text-blue-600 dark:text-blue-400"}`}
                      />
                      V_{chat.visitor_id.slice(0, 5)}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${mono.className}`}
                    >
                      {new Date(chat.updated_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-end w-full gap-4 mt-2">
                    <p
                      className={`text-sm truncate font-medium ${mono.className} ${activeChat?.id === chat.id ? "opacity-90" : "opacity-70"}`}
                    >
                      {chat.messages?.[0]?.content || "---"}
                    </p>

                    {unread[chat.id] && unread[chat.id] > 0 && (
                      <div
                        className={`shrink-0 border-2 border-background bg-red-500 text-white font-bold h-6 min-w-[24px] px-1 flex items-center justify-center text-xs shadow-[2px_2px_0_0_currentColor] ${mono.className}`}
                      >
                        {unread[chat.id]}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="border-4 border-foreground bg-background shadow-[8px_8px_0_0_currentColor] flex flex-col h-full overflow-hidden relative">
          {activeChat ? (
            <>
              <div className="border-b-4 border-foreground bg-background p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border-2 border-foreground bg-foreground text-background flex items-center justify-center shadow-[4px_4px_0_0_currentColor]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-extrabold uppercase tracking-tight text-xl">
                      V_{activeChat.visitor_id.slice(0, 5)}
                    </h2>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-green-600 dark:text-green-400 ${mono.className}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                      {activeChat.assignee?.name
                        ? `Assigned: ${activeChat.assignee.name}`
                        : "Waiting"}
                    </span>
                  </div>
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-widest border-2 border-foreground px-3 py-1 bg-foreground/5 hidden sm:block ${mono.className}`}
                >
                  ID: {activeChat.id.split("-")[0]}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[linear-gradient(45deg,transparent_25%,rgba(150,150,150,0.05)_25%,rgba(150,150,150,0.05)_50%,transparent_50%,transparent_75%,rgba(150,150,150,0.05)_75%,rgba(150,150,150,0.05)_100%)] bg-size-[20px_20px]">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-6 flex flex-col ${msg.sender_type === "admin" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 ${mono.className}`}
                    >
                      {msg.sender_type === "admin"
                        ? activeChat.assignee?.name || "Agent"
                        : `V_${activeChat.visitor_id.slice(0, 5)}`}
                    </div>
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-4 border-2 border-foreground whitespace-pre-wrap wrap-break-word text-sm sm:text-base font-medium shadow-[4px_4px_0_0_currentColor] ${
                        msg.sender_type === "admin"
                          ? "bg-blue-500 text-white shadow-blue-900 border-blue-900 dark:shadow-blue-300 dark:border-blue-300"
                          : "bg-background text-foreground"
                      }`}
                    >
                      <p className={`${mono.className} leading-relaxed`}>
                        {msg.content}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${mono.className} ${msg.sender_type === "admin" ? "text-blue-500" : "opacity-50"}`}
                    >
                      {new Date(
                        msg.created_at || Date.now(),
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
                {isTypingVisitor && (
                  <div className="mb-6 flex flex-col items-start">
                    <div
                      className={`text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 ${mono.className}`}
                    >
                      V_{activeChat.visitor_id.slice(0, 5)}
                    </div>
                    <div className="px-4 py-3 border-2 border-foreground bg-background shadow-[4px_4px_0_0_currentColor]">
                      <span
                        className={`font-bold uppercase tracking-widest text-sm ${mono.className}`}
                      >
                        SYS.RECV{typingDots}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              {activeChat?.assigned_to && me?.id === activeChat.assigned_to ? (
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t-4 border-foreground bg-background shrink-0 flex gap-4"
                >
                  <input
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Transmit message..."
                    className={`flex-1 border-4 border-foreground bg-background p-4 font-bold md:text-lg shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all placeholder:opacity-30 ${mono.className}`}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`w-16 md:w-auto shrink-0 flex items-center justify-center gap-2 border-4 border-foreground bg-foreground text-background px-0 md:px-8 font-bold uppercase tracking-widest shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0_0_currentColor] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[4px_4px_0_0_currentColor] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none ${mono.className}`}
                  >
                    <Send className="w-5 h-5" />
                    <span className="hidden md:inline">Transmit</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t-4 border-foreground bg-background shrink-0 flex items-center justify-between gap-4">
                  <p
                    className={`text-sm font-bold uppercase tracking-widest opacity-70 ${mono.className}`}
                  >
                    Join untuk menangani chat ini. Input akan aktif setelah join.
                  </p>
                  <button
                    type="button"
                    onClick={handleJoinChat}
                    className={`shrink-0 border-4 border-foreground bg-foreground text-background px-6 font-bold uppercase tracking-widest shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0_0_currentColor] transition-all focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none ${mono.className}`}
                  >
                    Join
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[linear-gradient(45deg,transparent_25%,rgba(150,150,150,0.05)_25%,rgba(150,150,150,0.05)_50%,transparent_50%,transparent_75%,rgba(150,150,150,0.05)_75%,rgba(150,150,150,0.05)_100%)] bg-size-[20px_20px]">
              <Terminal className="w-16 h-16 mb-6 opacity-20" />
              <h2 className="text-3xl font-extrabold uppercase tracking-tight mb-2 opacity-30">
                Awaiting Input
              </h2>
              <p
                className={`text-sm font-bold uppercase tracking-widest opacity-40 ${mono.className}`}
              >
                Select a transmission feed to initialize comms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
