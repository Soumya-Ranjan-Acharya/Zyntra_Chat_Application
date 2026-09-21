import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import { connectDB } from './config/db.js';
import { setupChatSocket } from './sockets/chatSocket.js';

const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      process.env.CLIENT_URL || 'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Socket.io initialization
setupChatSocket(io);

// Connect to MongoDB Atlas and start listening
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Zyntra Backend Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for realtime communication`);
    console.log(`🌐 Health check available at: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}).catch((err) => {
  console.error('Fatal: Could not connect to MongoDB Atlas at startup:', err.message);
  // Still listen so health check and offline fallbacks are accessible
  server.listen(PORT, () => {
    console.log(`⚠️ Server running in offline-fallback mode on port ${PORT}`);
  });
});

export { app, server, io };
