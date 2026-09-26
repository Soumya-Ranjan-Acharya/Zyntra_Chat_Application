import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.activeRooms = new Set();
    this.listeners = {
      receive_message: new Set(),
      message_edited: new Set(),
      message_deleted: new Set(),
      update_reaction: new Set(),
      user_typing: new Set(),
      user_avatar_updated: new Set(),
    };
  }

  getSocket() {
    if (!this.socket) {
      return this.initSocket();
    }
    return this.socket;
  }

  initSocket() {
    if (this.socket) return this.socket;

    const token = typeof window !== 'undefined' ? localStorage.getItem('zyntra_auth_token') : null;

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        token: token || undefined,
      },
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to backend server:', this.socket.id);
      // Re-join all active rooms on reconnect
      this.activeRooms.forEach((roomId) => {
        this.socket.emit('join_room', roomId);
      });
    });

    this.socket.on('connect_error', (error) => {
      console.warn('[SocketService] Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Socket disconnected:', reason);
    });

    // Wire internal socket event dispatchers to registered service listeners
    this.socket.on('receive_message', (msg) => {
      this.listeners.receive_message.forEach((fn) => fn(msg));
    });

    this.socket.on('message_edited', (msg) => {
      this.listeners.message_edited.forEach((fn) => fn(msg));
    });

    this.socket.on('message_deleted', (data) => {
      this.listeners.message_deleted.forEach((fn) => fn(data));
    });

    this.socket.on('update_reaction', (msg) => {
      this.listeners.update_reaction.forEach((fn) => fn(msg));
    });

    this.socket.on('user_typing', (data) => {
      this.listeners.user_typing.forEach((fn) => fn(data));
    });

    this.socket.on('user_avatar_updated', (data) => {
      this.listeners.user_avatar_updated.forEach((fn) => fn(data));
    });

    return this.socket;
  }

  updateAuthToken(token) {
    if (this.socket) {
      this.socket.auth = { token };
      if (!this.socket.connected) {
        this.socket.connect();
      }
    }
  }

  // Room Join with Authorization ACK
  joinChatRoom(roomId) {
    if (!roomId) return;
    this.activeRooms.add(roomId);
    const s = this.getSocket();
    if (s && s.connected) {
      s.emit('join_room', roomId);
    } else if (s) {
      s.once('connect', () => {
        s.emit('join_room', roomId);
      });
    }
  }

  // Room Leave (Ensures old rooms do not leak on context switch)
  leaveChatRoom(roomId) {
    if (!roomId) return;
    this.activeRooms.delete(roomId);
    const s = this.getSocket();
    if (s && s.connected) {
      s.emit('leave_room', roomId);
    }
  }

  // Clear all rooms (for context switch or logout)
  leaveAllRooms() {
    const s = this.getSocket();
    if (s && s.connected) {
      this.activeRooms.forEach((roomId) => {
        s.emit('leave_room', roomId);
      });
    }
    this.activeRooms.clear();
  }

  /**
   * Send Message via Socket.IO with Server ACK (Rule 1 & 3)
   * @param {Object} messageData - Payload containing clientTempId, chatId, ciphertext, nonce, etc.
   * @returns {Promise<{ success: boolean, message: Object, clientTempId: string }>}
   */
  sendMessage(messageData) {
    return new Promise((resolve, reject) => {
      const s = this.getSocket();
      if (!s || !s.connected) {
        // If socket is momentarily connecting, wait once for connect
        if (s) {
          const timer = setTimeout(() => {
            reject(new Error('Socket disconnected, message could not be sent'));
          }, 6000);

          s.once('connect', () => {
            clearTimeout(timer);
            s.emit('send_message', messageData, (res) => {
              if (res?.success) resolve(res);
              else reject(new Error(res?.error || 'Send failed'));
            });
          });
          return;
        }
        return reject(new Error('Socket connection unavailable'));
      }

      const timeoutTimer = setTimeout(() => {
        reject(new Error('Timeout waiting for server message ACK'));
      }, 10000);

      s.emit('send_message', messageData, (response) => {
        clearTimeout(timeoutTimer);
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Server rejected message'));
        }
      });
    });
  }

  // Edit Message via Socket
  editMessage(data) {
    return new Promise((resolve, reject) => {
      const s = this.getSocket();
      if (!s || !s.connected) return reject(new Error('Socket not connected'));

      s.emit('edit_message', data, (response) => {
        if (response && response.success) resolve(response.message);
        else reject(new Error(response?.error || 'Edit failed'));
      });
    });
  }

  // Delete Message via Socket
  deleteMessage(data) {
    return new Promise((resolve, reject) => {
      const s = this.getSocket();
      if (!s || !s.connected) return reject(new Error('Socket not connected'));

      s.emit('delete_message', data, (response) => {
        if (response && response.success) resolve(response);
        else reject(new Error(response?.error || 'Delete failed'));
      });
    });
  }

  // Realtime Reactions
  sendReaction(messageId, emoji, chatId) {
    const s = this.getSocket();
    if (s && s.connected) {
      s.emit('send_reaction', { messageId, emoji, chatId });
    }
  }

  // Realtime Typing
  emitTyping(roomId, isTyping) {
    const s = this.getSocket();
    if (s && s.connected) {
      if (isTyping) {
        s.emit('typing_start', { roomId });
      } else {
        s.emit('typing_stop', { roomId });
      }
    }
  }

  // Avatar updates
  emitAvatarUpdate(username, avatar) {
    const s = this.getSocket();
    if (s && s.connected) {
      s.emit('update_avatar', { username, avatar });
    }
  }

  // Event Subscription methods
  onReceiveMessage(handler) {
    this.listeners.receive_message.add(handler);
    return () => this.listeners.receive_message.delete(handler);
  }

  onMessageEdited(handler) {
    this.listeners.message_edited.add(handler);
    return () => this.listeners.message_edited.delete(handler);
  }

  onMessageDeleted(handler) {
    this.listeners.message_deleted.add(handler);
    return () => this.listeners.message_deleted.delete(handler);
  }

  onUpdateReaction(handler) {
    this.listeners.update_reaction.add(handler);
    return () => this.listeners.update_reaction.delete(handler);
  }

  onUserTyping(handler) {
    this.listeners.user_typing.add(handler);
    return () => this.listeners.user_typing.delete(handler);
  }

  onAvatarUpdated(handler) {
    this.listeners.user_avatar_updated.add(handler);
    return () => this.listeners.user_avatar_updated.delete(handler);
  }
}

export const socketService = new SocketService();
