import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { Contact } from '../models/Contact.js';
import Message from '../models/Message.js';

async function check() {
  await connectDB();
  const anita = await User.findOne({ primaryUsername: 'anita' }).lean();
  console.log('Anita User in DB:', {
    id: anita?._id,
    name: anita?.name,
    username: anita?.primaryUsername,
    hasAvatar: !!anita?.avatar,
    avatarPrefix: anita?.avatar ? anita.avatar.substring(0, 50) : null
  });

  const contacts = await Contact.find({}).lean();
  console.log('\nAll Contact records in DB:');
  contacts.forEach(c => {
    console.log({
      id: c.id,
      ownerId: c.ownerId,
      name: c.name,
      username: c.username,
      hasAvatar: !!c.avatar,
      avatarPrefix: c.avatar ? c.avatar.substring(0, 40) : null
    });
  });

  const messages = await Message.find({ chatId: 'dm_anita_soumya' }).sort({ timestamp: -1 }).limit(3).lean();
  console.log('\nRecent Messages in dm_anita_soumya:');
  messages.forEach(m => {
    console.log({
      senderUsername: m.senderUsername,
      content: m.content,
      hasSenderAvatar: !!m.senderAvatar
    });
  });

  process.exit(0);
}

check();
