import Message from '../models/Message.js';
import { Contact } from '../models/Contact.js';
import User from '../models/User.js';

// @desc    Get all messages for a specific chat (channel, contact, or personal group)
// @route   GET /api/messages/:chatId
// @access  Public / Private
export const getMessagesByChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 }).lean();

    // Populate live senderAvatar from User collection if missing or outdated
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

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages/:chatId
// @access  Public / Private
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const {
      id,
      content,
      senderId,
      senderName,
      senderUsername,
      senderAvatar,
      chatType,
      attachment,
      timestamp,
    } = req.body;

    if (!chatId || (!content?.trim() && !attachment)) {
      return res.status(400).json({
        success: false,
        message: 'chatId and either content or attachment are required',
      });
    }

    const newId = id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const finalContent = content ? content.trim() : '';
    const previewText = finalContent || (attachment?.type === 'image' ? '📷 Photo' : `📎 ${attachment?.name || 'Attachment'}`);

    let message = await Message.findOne({ id: newId });
    if (!message) {
      message = await Message.create({
        id: newId,
        chatId,
        chatType: chatType || 'workspace-node',
        senderId: senderId || req.user?._id?.toString() || 'user-1',
        senderName: senderName || req.user?.name || 'Soumya',
        senderUsername: senderUsername || req.user?.primaryUsername || '',
        senderAvatar: senderAvatar || req.user?.avatar || null,
        content: finalContent,
        type: attachment?.type || 'text',
        attachment: attachment || null,
        reactions: [],
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      });
    }

    await Contact.updateMany(
      { id: chatId },
      { lastMessage: previewText, lastMessageTime: new Date() }
    ).catch(() => {});

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit an existing message
// @route   PUT /api/messages/:id
// @access  Public / Private
export const editMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content cannot be empty',
      });
    }

    const message = await Message.findOne({ id });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Public / Private
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findOneAndDelete({ id });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or increment reaction on a message
// @route   POST /api/messages/:id/reactions
// @access  Public / Private
export const addReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji, userId } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required',
      });
    }

    const message = await Message.findOne({ id });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const uid = userId || req.user?._id?.toString() || 'user-1';
    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      if (!existingReaction.users.includes(uid)) {
        existingReaction.users.push(uid);
      }
      existingReaction.count = existingReaction.users.length;
    } else {
      message.reactions.push({
        emoji,
        count: 1,
        users: [uid],
      });
    }

    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
