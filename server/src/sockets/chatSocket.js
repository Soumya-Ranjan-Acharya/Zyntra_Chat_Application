import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { messageService } from '../services/messageService.js';
import { authorizationService } from '../services/authorizationService.js';

export const setupChatSocket = (io) => {
  // 1. Socket.IO Handshake Authentication Middleware (Rule 5 & 6)
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const token =
        socket.handshake.auth?.token ||
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zyntra_secret_fallback');
        const user = await User.findById(decoded.id);
        if (user) {
          socket.user = user;
          return next();
        }
      }

      // If no token or token invalid, check if running demo user or fallback
      if (process.env.NODE_ENV !== 'production') {
        const demoUser = await User.findOne({ primaryUsername: 'soumya' });
        if (demoUser) {
          socket.user = demoUser;
          return next();
        }
      }

      return next(new Error('Authentication failed: Valid user credentials required'));
    } catch (err) {
      console.warn('[Socket.io] Auth middleware rejection:', err.message);
      return next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket.io] Client connected: ${socket.id} (User: ${user?.primaryUsername || user?._id})`);

    // 2. Join chat room with authorization verification (Rule 7 & 8)
    socket.on('join_room', async (roomId, ackCallback) => {
      try {
        if (!roomId) return;

        const authCheck = await authorizationService.canJoinRoom(socket.user, roomId);
        if (!authCheck.authorized) {
          console.warn(`[Socket.io] Unauthorized room join rejected: User ${socket.user?.primaryUsername} -> ${roomId}`);
          if (typeof ackCallback === 'function') {
            ackCallback({ success: false, error: authCheck.reason || 'Unauthorized' });
          }
          socket.emit('error_message', { message: authCheck.reason || 'Unauthorized to join room' });
          return;
        }

        socket.join(roomId);
        console.log(`[Socket.io] User ${socket.user?.primaryUsername} joined room: ${roomId}`);
        if (typeof ackCallback === 'function') {
          ackCallback({ success: true, roomId });
        }
      } catch (err) {
        console.error('[Socket.io] join_room error:', err.message);
      }
    });

    // 3. Leave a room (Rule 17: Context switching must not leak old socket rooms)
    socket.on('leave_room', (roomId, ackCallback) => {
      if (!roomId) return;
      socket.leave(roomId);
      console.log(`[Socket.io] User ${socket.user?.primaryUsername} left room: ${roomId}`);
      if (typeof ackCallback === 'function') {
        ackCallback({ success: true, roomId });
      }
    });

    // 4. Send Message (Rule 1: Socket.IO is ONLY message creation path; Rule 3, 4, 6)
    socket.on('send_message', async (data, ackCallback) => {
      try {
        if (!data || !data.chatId) {
          if (typeof ackCallback === 'function') {
            ackCallback({ success: false, error: 'Chat ID is required' });
          }
          return;
        }

        // Delegate persistence and validation to MessageService (which checks AuthorizationService)
        const savedMessage = await messageService.saveMessage(socket.user, data);

        const payload = savedMessage.toObject ? savedMessage.toObject() : savedMessage;

        // Server ACK with saved message ID and clientTempId (Rule 3)
        if (typeof ackCallback === 'function') {
          ackCallback({
            success: true,
            message: payload,
            clientTempId: data.clientTempId || null,
          });
        }

        // Broadcast ciphertext only to room peers (Rule 12, 13)
        socket.to(data.chatId).emit('receive_message', payload);
      } catch (err) {
        console.error('[Socket.io] Error sending message:', err.message);
        if (typeof ackCallback === 'function') {
          ackCallback({ success: false, error: err.message });
        }
        socket.emit('error_message', { message: err.message || 'Failed to send message via socket' });
      }
    });

    // 5. Edit Message (Encrypted edit support)
    socket.on('edit_message', async (data, ackCallback) => {
      try {
        const { messageId, ciphertext, nonce, content, chatId } = data;
        const updated = await messageService.editMessage(socket.user, messageId, {
          ciphertext,
          nonce,
          content,
        });

        const payload = updated.toObject ? updated.toObject() : updated;
        if (typeof ackCallback === 'function') {
          ackCallback({ success: true, message: payload });
        }

        io.to(chatId || updated.chatId).emit('message_edited', payload);
      } catch (err) {
        console.error('[Socket.io] Error editing message:', err.message);
        if (typeof ackCallback === 'function') {
          ackCallback({ success: false, error: err.message });
        }
      }
    });

    // 6. Delete Message
    socket.on('delete_message', async (data, ackCallback) => {
      try {
        const { messageId, chatId } = data;
        await messageService.deleteMessage(socket.user, messageId);

        if (typeof ackCallback === 'function') {
          ackCallback({ success: true, messageId });
        }

        io.to(chatId).emit('message_deleted', { messageId, chatId });
      } catch (err) {
        console.error('[Socket.io] Error deleting message:', err.message);
        if (typeof ackCallback === 'function') {
          ackCallback({ success: false, error: err.message });
        }
      }
    });

    // 7. Typing status
    socket.on('typing_start', ({ roomId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', {
        userId: socket.user._id.toString(),
        userName: socket.user.name || socket.user.primaryUsername,
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ roomId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', {
        userId: socket.user._id.toString(),
        isTyping: false,
      });
    });

    // 8. Reactions
    socket.on('send_reaction', async ({ messageId, emoji, chatId }) => {
      try {
        const updated = await messageService.addReaction(socket.user, messageId, emoji);
        if (updated) {
          const payload = updated.toObject ? updated.toObject() : updated;
          io.to(chatId || updated.chatId).emit('update_reaction', payload);
        }
      } catch (err) {
        console.error('[Socket.io] Error updating reaction:', err.message);
      }
    });

    // 9. Avatar update
    socket.on('update_avatar', ({ username, avatar }) => {
      const cleanUser = username || socket.user.primaryUsername;
      if (cleanUser) {
        io.emit('user_avatar_updated', { username: cleanUser, avatar });
      }
    });

    // 10. Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (${socket.user?.primaryUsername})`);
    });
  });
};
