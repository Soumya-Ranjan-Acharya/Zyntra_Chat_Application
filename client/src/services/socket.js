import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
const joinedRooms = new Set();

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('[Zyntra Realtime] Connected to backend socket server:', socket.id);
      // Re-join all active rooms on reconnect
      joinedRooms.forEach((roomId) => {
        socket.emit('join_room', roomId);
      });
    });

    socket.on('connect_error', (error) => {
      console.warn('[Zyntra Realtime] Socket connection deferred (backend offline or starting):', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Zyntra Realtime] Socket disconnected:', reason);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinChatRoom = (roomId) => {
  if (!roomId) return;
  joinedRooms.add(roomId);
  const s = getSocket();
  if (s && s.connected) {
    s.emit('join_room', roomId);
  } else if (s) {
    s.once('connect', () => {
      s.emit('join_room', roomId);
    });
  }
};

export const leaveChatRoom = (roomId) => {
  if (!roomId) return;
  joinedRooms.delete(roomId);
  const s = getSocket();
  if (s && s.connected) {
    s.emit('leave_room', roomId);
  }
};

export const emitSocketMessage = (data) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('send_message', data);
  }
};

export const emitTyping = (roomId, userName, userId, isTyping) => {
  const s = getSocket();
  if (s && s.connected) {
    if (isTyping) {
      s.emit('typing_start', { roomId, userName, userId });
    } else {
      s.emit('typing_stop', { roomId, userId });
    }
  }
};

export const emitReaction = (messageId, emoji, userId, chatId) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('send_reaction', { messageId, emoji, userId, chatId });
  }
};

export const emitAvatarUpdate = (username, avatar) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('update_avatar', { username, avatar });
  }
};
