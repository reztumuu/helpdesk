import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
// Use WHATWG URL API instead of deprecated url.parse

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = new URL(req.url!, `http://${hostname}:${port}`);
      
      if (parsedUrl.pathname === '/_socket/emit' && req.method === 'POST') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}');
            const event = payload.event;
            const data = payload.data || {};
            if (event === 'new-message') {
              const { chatId, apiKey } = data;
              if (apiKey) {
                io.to(`website-${apiKey}`).emit('new-message', data);
              }
              if (chatId) {
                io.to(`chat-${chatId}`).emit('new-message', data);
              }
            } else if (event === 'chat-started') {
              const { websiteId, apiKey, chatId } = data;
              if (apiKey) {
                io.to(`website-${apiKey}`).emit('chat-started', { websiteId, apiKey, chatId });
              } else if (websiteId) {
                io.to(`website-${websiteId}`).emit('chat-started', { websiteId, chatId });
              }
            } else if (event === 'chat-joined') {
              const { websiteId, apiKey, chatId } = data;
              if (apiKey) {
                io.to(`website-${apiKey}`).emit('chat-joined', data);
              }
              if (chatId) {
                io.to(`chat-${chatId}`).emit('chat-joined', data);
              }
            } else if (event === 'chat-ended') {
              const { websiteId, apiKey, chatId, chat } = data;
              if (apiKey) {
                io.to(`website-${apiKey}`).emit('chat-ended', { websiteId, apiKey, chatId, chat });
              } else if (websiteId) {
                io.to(`website-${websiteId}`).emit('chat-ended', { websiteId, chatId, chat });
              }
              if (chatId) {
                io.to(`chat-${chatId}`).emit('chat-ended', { chatId, chat });
              }
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
          }
        });
        return;
      }
      
      await handle(req, res);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    
    // Join website room
    socket.on('join-website', (data) => {
        const { apiKey } = data;
        if (apiKey) {
            socket.join(`website-${apiKey}`);
            console.log(`Socket ${socket.id} joined website-${apiKey}`);
        }
    });
    
    // Chat message
    socket.on('chat-message', (data) => {
        // Prefer server-side emit; keep minimal broadcast to chat room only
        if (data.chatId) {
             io.to(`chat-${data.chatId}`).emit('new-message', data);
        }
    });
    
    // Join specific chat room for direct updates
    socket.on('join-chat', (chatId) => {
        if (chatId) {
            socket.join(`chat-${chatId}`);
            console.log(`Socket ${socket.id} joined chat-${chatId}`);
        }
    });
    
    // Typing indicators
    socket.on('typing-start', (data) => {
        if (data.chatId) {
            socket.to(`chat-${data.chatId}`).emit('user-typing', data);
        }
    });
    
    socket.on('typing-stop', (data) => {
        if (data.chatId) {
            socket.to(`chat-${data.chatId}`).emit('user-stopped-typing', data);
        }
    });

    socket.on('visitor-online', (data) => {
        const { websiteId, apiKey, chatId } = data || {};
        if (apiKey) {
            io.to(`website-${apiKey}`).emit('visitor-online', { websiteId, apiKey, chatId });
        } else if (websiteId) {
            io.to(`website-${websiteId}`).emit('visitor-online', { websiteId, chatId });
        }
    });
    
    socket.on('visitor-offline', (data) => {
        const { websiteId, apiKey, chatId } = data || {};
        if (apiKey) {
            io.to(`website-${apiKey}`).emit('visitor-offline', { websiteId, apiKey, chatId });
        } else if (websiteId) {
            io.to(`website-${websiteId}`).emit('visitor-offline', { websiteId, chatId });
        }
    });
    
    socket.on('chat-started', (data) => {
        const { websiteId, apiKey, chatId } = data || {};
        if (apiKey) {
            io.to(`website-${apiKey}`).emit('chat-started', { websiteId, apiKey, chatId });
        } else if (websiteId) {
            io.to(`website-${websiteId}`).emit('chat-started', { websiteId, chatId });
        }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
