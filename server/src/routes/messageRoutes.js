import express from 'express';
import {
  getMessagesByChat,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  saveGroupKey,
  getGroupKey,
} from '../controllers/messageController.js';
import { optionalProtect, protect } from '../middleware/auth.js';

const router = express.Router();

// Group Key Management Routes
router.post('/keys/group', protect, saveGroupKey);
router.get('/keys/group/:conversationId', protect, getGroupKey);

// Message History & Actions
router.get('/:chatId', optionalProtect, getMessagesByChat);
router.post('/:chatId', optionalProtect, sendMessage);
router.put('/:id', optionalProtect, editMessage);
router.delete('/:id', optionalProtect, deleteMessage);
router.post('/:id/reactions', optionalProtect, addReaction);

export default router;
