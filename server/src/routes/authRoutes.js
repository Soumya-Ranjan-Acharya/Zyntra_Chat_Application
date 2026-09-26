import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  addContext,
  uploadIdentityKey,
  getPublicKey,
} from '../controllers/authController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/context', protect, addContext);

// Device identity keys
router.post('/keys', protect, uploadIdentityKey);
router.get('/keys/:identifier', optionalProtect, getPublicKey);

export default router;
