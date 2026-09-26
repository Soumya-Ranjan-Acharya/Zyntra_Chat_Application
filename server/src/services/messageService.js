import { messageRepository } from '../repositories/messageRepository.js';
import { authorizationService } from './authorizationService.js';
import { Contact } from '../models/Contact.js';
import User from '../models/User.js';

export class MessageService {
  /**
   * Save a newly incoming message
   * @param {Object} user - The authenticated User document
   * @param {Object} payload - The message payload
   */
  async saveMessage(user, payload) {
    const {
      id,
      clientTempId,
      chatId,
      ciphertext,
      nonce,
      encryptionVersion = 1,
      keyId,
      chatType = 'workspace-node',
      type = 'text',
      timestamp,
      content, // legacy fallback only
    } = payload;

    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    // New messages must contain ciphertext & nonce (or legacy content)
    if (!ciphertext && !content) {
      throw new Error('Message ciphertext and nonce are required');
    }

    // 1. Authorize sender for this conversation
    const authCheck = await authorizationService.canSendMessage(user, chatId);
    if (!authCheck.authorized) {
      throw new Error(`Unauthorized to send messages in this chat: ${authCheck.reason || 'Permission denied'}`);
    }

    const messageId = id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 2. Prevent duplicate messages and double writes (Rule 4)
    const existing = await messageRepository.findById(messageId);
    if (existing) {
      return existing;
    }

    // 3. Derive user identity from authentication; NEVER trust client senderId (Rule 6)
    const senderId = user._id.toString();
    const senderName = user.name || 'User';
    const senderUsername = user.primaryUsername || '';
    const senderAvatar = user.avatar || null;

    // 4. Construct message document
    // Keep Message.content nullable; new messages use ciphertext + nonce + encryptionVersion (Rule 15)
    // Never store plaintext in DB for new encrypted messages!
    const messageData = {
      id: messageId,
      clientTempId: clientTempId || null,
      chatId,
      chatType,
      senderId,
      senderName,
      senderUsername,
      senderAvatar,
      content: ciphertext ? null : (content || null),
      ciphertext: ciphertext || null,
      nonce: nonce || null,
      encryptionVersion: encryptionVersion || 1,
      keyId: keyId || null,
      type,
      attachment: null, // attachment metadata is encrypted inside ciphertext
      reactions: [],
      isEdited: false,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    const savedMessage = await messageRepository.create(messageData);

    // Update contacts table with privacy-preserving indicator
    const previewText = ciphertext ? '🔒 Encrypted message' : (content ? content.slice(0, 30) : 'Attachment');
    await Contact.updateMany(
      { id: chatId },
      { lastMessage: previewText, lastMessageTime: new Date() }
    ).catch(() => {});

    return savedMessage;
  }

  /**
   * Fetch conversation history
   * @param {Object} user - The authenticated User document
   * @param {String} chatId - Conversation identifier
   */
  async getHistory(user, chatId) {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    // Authorize read access
    if (user) {
      const authCheck = await authorizationService.canReadHistory(user, chatId);
      if (!authCheck.authorized) {
        throw new Error(`Unauthorized to read chat history: ${authCheck.reason || 'Access denied'}`);
      }
    }

    const messages = await messageRepository.findByChatId(chatId);

    // Populate fresh sender avatar from User collection if needed
    const senderUsernames = [
      ...new Set(
        messages
          .map((m) => m.senderUsername?.trim().replace(/^@/, '').toLowerCase())
          .filter(Boolean)
      ),
    ];

    if (senderUsernames.length > 0) {
      const users = await User.find(
        { primaryUsername: { $in: senderUsernames } },
        'primaryUsername avatar'
      ).lean();

      const userAvatarMap = new Map();
      users.forEach((u) => {
        if (u.primaryUsername && u.avatar) {
          userAvatarMap.set(u.primaryUsername.toLowerCase(), u.avatar);
        }
      });

      messages.forEach((m) => {
        const cleanSender = m.senderUsername?.trim().replace(/^@/, '').toLowerCase();
        if ((!m.senderAvatar || m.senderAvatar.length < 5) && userAvatarMap.has(cleanSender)) {
          m.senderAvatar = userAvatarMap.get(cleanSender);
        }
      });
    }

    return messages;
  }

  /**
   * Edit an existing message (encrypting new content)
   */
  async editMessage(user, messageId, { ciphertext, nonce, content }) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== user._id.toString()) {
      throw new Error('Forbidden: Only the message author can edit this message');
    }

    const updateFields = {
      isEdited: true,
    };

    if (ciphertext) {
      updateFields.ciphertext = ciphertext;
      updateFields.nonce = nonce;
      updateFields.content = null;
    } else if (content) {
      updateFields.content = content.trim();
    }

    return await messageRepository.update(messageId, updateFields);
  }

  /**
   * Delete a message
   */
  async deleteMessage(user, messageId) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== user._id.toString()) {
      throw new Error('Forbidden: Only the message author can delete this message');
    }

    return await messageRepository.delete(messageId);
  }

  /**
   * Add a reaction
   */
  async addReaction(user, messageId, emoji) {
    return await messageRepository.addReaction(messageId, emoji, user._id.toString());
  }
}

export const messageService = new MessageService();
