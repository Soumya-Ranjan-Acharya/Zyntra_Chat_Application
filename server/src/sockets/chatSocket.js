import Message from '../models/Message.js';
import { Contact } from '../models/Contact.js';

export const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join a specific chat room (channel, DM, or personal group)
    socket.on('join_room', (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`[Socket.io] User (${socket.id}) joined room: ${roomId}`);
    });

    // Leave a room
    socket.on('leave_room', (roomId) => {
      if (!roomId) return;
      socket.leave(roomId);
      console.log(`[Socket.io] User (${socket.id}) left room: ${roomId}`);
    });

    // Handle incoming message
    socket.on('send_message', async (data) => {
      try {
        const {
          id,
          chatId,
          content,
          senderId,
          senderName,
          senderUsername,
          senderAvatar,
          chatType,
          attachment,
          timestamp,
        } = data;

        if (!chatId || (!content?.trim() && !attachment)) return;

        const messageId = id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const finalContent = content ? content.trim() : '';
        const previewText = finalContent || (attachment?.type === 'image' ? '📷 Photo' : `📎 ${attachment?.name || 'Attachment'}`);

        // Check if message with this ID already exists
        let message = await Message.findOne({ id: messageId });
        if (!message) {
          message = await Message.create({
            id: messageId,
            chatId,
            chatType: chatType || 'workspace-node',
            senderId: senderId || 'user-1',
            senderName: senderName || 'Soumya',
            senderUsername: senderUsername || '',
            senderAvatar: senderAvatar || null,
            content: finalContent,
            type: attachment?.type || 'text',
            attachment: attachment || null,
            reactions: [],
            timestamp: timestamp ? new Date(timestamp) : new Date(),
          });
        }

        // Update contacts lastMessage so sidebar updates on both sides
        await Contact.updateMany(
          { id: chatId },
          { lastMessage: previewText, lastMessageTime: new Date() }
        ).catch(() => {});

        // Broadcast to peers in the room (sender already has optimistic copy)
        const payload = message.toObject ? message.toObject() : message;
        socket.to(chatId).emit('receive_message', payload);
      } catch (err) {
        console.error('[Socket.io] Error sending message:', err.message);
        socket.emit('error_message', { message: 'Failed to send message via socket' });
      }
    });

    // Handle typing status
    socket.on('typing_start', ({ roomId, userName, userId }) => {
      socket.to(roomId).emit('user_typing', { userId, userName, isTyping: true });
    });

    socket.on('typing_stop', ({ roomId, userId }) => {
      socket.to(roomId).emit('user_typing', { userId, isTyping: false });
    });

    // Handle real-time reactions
    socket.on('send_reaction', async ({ messageId, emoji, userId, chatId }) => {
      try {
        const message = await Message.findOne({ id: messageId });
        if (!message) return;

        const uid = userId || 'user-1';
        const existing = message.reactions.find((r) => r.emoji === emoji);

        if (existing) {
          if (!existing.users.includes(uid)) {
            existing.users.push(uid);
          }
          existing.count = existing.users.length;
        } else {
          message.reactions.push({
            emoji,
            count: 1,
            users: [uid],
          });
        }

        await message.save();
        io.to(chatId || message.chatId).emit('update_reaction', message);
      } catch (err) {
        console.error('[Socket.io] Error updating reaction:', err.message);
      }
    });

    // Handle real-time avatar updates
    socket.on('update_avatar', ({ username, avatar }) => {
      if (username) {
        io.emit('user_avatar_updated', { username, avatar });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};
