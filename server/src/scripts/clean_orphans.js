import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

async function fix() {
  await connectDB();
  const soumya = await User.findOne({ primaryUsername: 'soumya' });
  await Message.updateMany(
    {
      chatId: 'dm_anita_soumya',
      $or: [{ senderUsername: '' }, { senderUsername: null }]
    },
    {
      $set: {
        senderUsername: 'soumya',
        senderName: 'Soumya Mohanty',
        senderAvatar: soumya.avatar
      }
    }
  );
  console.log('Fixed orphan messages in dm_anita_soumya');
  process.exit(0);
}

fix();
