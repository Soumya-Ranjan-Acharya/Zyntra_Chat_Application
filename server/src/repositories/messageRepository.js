import Message from '../models/Message.js';

export class MessageRepository {
  /**
   * Create and persist a new message document
   */
  async create(messageData) {
    return await Message.create(messageData);
  }

  /**
   * Find a message by its unique business ID
   */
  async findById(id) {
    return await Message.findOne({ id });
  }

  /**
   * Find messages by conversation / chat ID, ordered chronologically
   */
  async findByChatId(chatId, limit = 100) {
    return await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean();
  }

  /**
   * Update message by ID
   */
  async update(id, updateData) {
    return await Message.findOneAndUpdate({ id }, updateData, { new: true });
  }

  /**
   * Delete message by ID
   */
  async delete(id) {
    return await Message.findOneAndDelete({ id });
  }

  /**
   * Add or increment reaction on a message
   */
  async addReaction(id, emoji, userId) {
    const message = await Message.findOne({ id });
    if (!message) return null;

    const existingReaction = message.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      if (!existingReaction.users.includes(userId)) {
        existingReaction.users.push(userId);
      }
      existingReaction.count = existingReaction.users.length;
    } else {
      message.reactions.push({
        emoji,
        count: 1,
        users: [userId],
      });
    }

    await message.save();
    return message;
  }
}

export const messageRepository = new MessageRepository();
