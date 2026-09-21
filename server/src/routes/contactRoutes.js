import express from 'express';
import {
  getContactsAndGroups,
  createContact,
  createPersonalGroup,
  searchUsers,
} from '../controllers/contactController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalProtect, getContactsAndGroups);
router.get('/search', optionalProtect, searchUsers);
router.post('/', optionalProtect, createContact);
router.post('/groups', optionalProtect, createPersonalGroup);

export default router;
