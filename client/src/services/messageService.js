import { encryptionService } from './encryptionService';
import { socketService } from './socketService';
import { api } from './api';

export class MessageService {
  /**
   * Send a new message through the E2EE pipeline (Rule 1 & 3 & 12 & 13)
   * Pipeline: plaintext -> encrypt locally -> ciphertext -> Socket.IO -> authenticate -> authorize -> persist -> ACK
   * 
   * @param {Object} params
   * @param {string} params.clientTempId - Optimistic client identifier
   * @param {string} params.chatId - Destination room/chat identifier
   * @param {string} params.content - Plaintext message text
   * @param {Object} params.attachment - Optional attachment object
   * @param {string} params.chatType - 'direct' | 'personal-group' | 'workspace-node'
   * @param {Object} params.participantInfo - Current user and peer details
   * @returns {Promise<{ clientTempId: string, message: Object }>}
   */
  async sendMessage({
    clientTempId,
    chatId,
    content,
    attachment = null,
    chatType = 'workspace-node',
    participantInfo = null,
  }) {
    if (!chatId || (!content?.trim() && !attachment)) {
      throw new Error('Valid chatId and message content or attachment required');
    }

    const trimmedContent = content ? content.trim() : '';

    // 1. Local Encryption on sender device (Rule 9, 10, 12)
    // Both text and attachment metadata are securely encrypted inside the ciphertext payload
    const payloadToEncrypt = {
      text: trimmedContent,
      attachment: attachment
        ? {
            type: attachment.type,
            name: attachment.name,
            size: attachment.size,
            url: attachment.url,
            mimeType: attachment.mimeType,
          }
        : null,
    };

    const { ciphertext, nonce, encryptionVersion, keyId } =
      await encryptionService.encryptMessage(
        chatId,
        payloadToEncrypt,
        chatType,
        participantInfo
      );

    // 2. Transmit ciphertext only over Socket.IO (Rule 1, 13)
    const socketPayload = {
      clientTempId,
      chatId,
      chatType,
      ciphertext,
      nonce,
      encryptionVersion,
      keyId,
      type: attachment?.type || 'text',
      timestamp: new Date().toISOString(),
    };

    // 3. Send via SocketService and await server ACK
    const ack = await socketService.sendMessage(socketPayload);

    return {
      clientTempId,
      message: ack.message,
    };
  }

  /**
   * Fetch conversation history via REST GET and decrypt locally (History flow)
   * Pipeline: REST GET -> MessageService -> encrypted messages -> client decryption -> chatStore
   */
  async fetchHistory(chatId, participantInfo = null) {
    if (!chatId) return [];

    const res = await api.messages.getByChat(chatId);
    if (!res.ok || !Array.isArray(res.data?.data)) {
      return [];
    }

    const encryptedMessages = res.data.data;

    // Decrypt all messages in history
    const decryptedList = await Promise.all(
      encryptedMessages.map(async (msg) => {
        try {
          return await encryptionService.decryptMessage(msg, participantInfo);
        } catch (err) {
          console.warn('[MessageService] History decrypt error:', err);
          return msg;
        }
      })
    );

    return decryptedList;
  }

  /**
   * Decrypt an incoming ciphertext message from Socket.IO (RECEIVE flow)
   * Pipeline: ciphertext -> client decryption -> plaintext -> chatStore
   */
  async decryptIncomingMessage(incomingMsg, participantInfo = null) {
    if (!incomingMsg) return null;
    return await encryptionService.decryptMessage(incomingMsg, participantInfo);
  }

  /**
   * Edit message with client-side re-encryption
   */
  async editMessage(chatId, messageId, newContent, chatType = 'workspace-node', participantInfo = null) {
    if (!newContent?.trim()) throw new Error('Content cannot be empty');

    // Encrypt new plaintext
    const { ciphertext, nonce } = await encryptionService.encryptMessage(
      chatId,
      { text: newContent.trim(), attachment: null },
      chatType,
      participantInfo
    );

    return await socketService.editMessage({
      chatId,
      messageId,
      ciphertext,
      nonce,
    });
  }

  /**
   * Delete message
   */
  async deleteMessage(chatId, messageId) {
    return await socketService.deleteMessage({ chatId, messageId });
  }

  /**
   * Send reaction
   */
  sendReaction(chatId, messageId, emoji) {
    socketService.sendReaction(messageId, emoji, chatId);
  }

  /**
   * Room management
   */
  joinRoom(roomId) {
    socketService.joinChatRoom(roomId);
  }

  leaveRoom(roomId) {
    socketService.leaveChatRoom(roomId);
  }

  leaveAllRooms() {
    socketService.leaveAllRooms();
  }
}

export const messageService = new MessageService();
