import { messageService } from '../services/messageService.js';
import GroupKey from '../models/GroupKey.js';
import { authorizationService } from '../services/authorizationService.js';

// @desc    Get all messages for a specific chat (channel, contact, or personal group)
// @route   GET /api/messages/:chatId
// @access  Public / Private
export const getMessagesByChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await messageService.getHistory(req.user, chatId);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message (Rule 1: Socket.IO is ONLY message creation/write path)
// @route   POST /api/messages/:chatId
// @access  Private / Rejected
export const sendMessage = async (req, res, next) => {
  try {
    // If client attempts REST POST, enforce Rule 1
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Socket.IO is the only message creation path.',
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
    const { ciphertext, nonce, content } = req.body;

    if (!ciphertext && !content) {
      return res.status(400).json({
        success: false,
        message: 'Ciphertext or content required for edit',
      });
    }

    const updated = await messageService.editMessage(req.user, id, {
      ciphertext,
      nonce,
      content,
    });

    res.status(200).json({
      success: true,
      data: updated,
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
    await messageService.deleteMessage(req.user, id);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reaction
// @route   POST /api/messages/:id/reactions
// @access  Public / Private
export const addReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required',
      });
    }

    const updated = await messageService.addReaction(req.user, id, emoji);

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Store or rotate encrypted group key envelope
// @route   POST /api/messages/keys/group
// @access  Private
export const saveGroupKey = async (req, res, next) => {
  try {
    const { conversationId, epoch, keys } = req.body;

    if (!conversationId || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'conversationId and keys array are required',
      });
    }

    if (req.user) {
      const auth = await authorizationService.canAccessChat(req.user, conversationId);
      if (!auth.authorized) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    const groupKey = await GroupKey.create({
      conversationId,
      epoch: epoch || 1,
      creatorId: req.user?._id?.toString() || 'user-1',
      keys,
    });

    res.status(201).json({
      success: true,
      data: groupKey,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get encrypted group key for current user in conversation
// @route   GET /api/messages/keys/group/:conversationId
// @access  Private
export const getGroupKey = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { epoch } = req.query;

    if (req.user) {
      const auth = await authorizationService.canAccessChat(req.user, conversationId);
      if (!auth.authorized) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    const query = { conversationId };
    if (epoch) {
      query.epoch = parseInt(epoch, 10);
    }

    // Get latest epoch for conversation
    const groupKeyDoc = await GroupKey.findOne(query).sort({ epoch: -1 });

    if (!groupKeyDoc) {
      return res.status(404).json({
        success: false,
        message: 'No group key envelope found for this conversation',
      });
    }

    const userId = req.user?._id?.toString() || 'user-1';
    const userEnvelope = groupKeyDoc.keys.find(
      (k) => k.userId === userId || k.userId === req.user?.primaryUsername
    );

    res.status(200).json({
      success: true,
      data: {
        conversationId: groupKeyDoc.conversationId,
        epoch: groupKeyDoc.epoch,
        creatorId: groupKeyDoc.creatorId,
        envelope: userEnvelope || null,
        allKeysCount: groupKeyDoc.keys.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
