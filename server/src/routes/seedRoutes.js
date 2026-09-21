import express from 'express';
import { triggerSeed } from '../controllers/seedController.js';

const router = express.Router();

router.post('/', triggerSeed);

export default router;
