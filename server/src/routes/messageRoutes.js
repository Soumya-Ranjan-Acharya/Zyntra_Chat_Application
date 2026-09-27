import express from 'express';
import {
  getMessagesByChat,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
} from '../controllers/messageController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:chatId', optionalProtect, getMessagesByChat);
router.post('/:chatId', optionalProtect, sendMessage);
router.put('/:id', optionalProtect, editMessage);
router.delete('/:id', optionalProtect, deleteMessage);
router.post('/:id/reactions', optionalProtect, addReaction);

export default router;
