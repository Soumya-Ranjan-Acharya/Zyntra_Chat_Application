import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { Contact } from '../models/Contact.js';
import Message from '../models/Message.js';

async function syncAllAvatars() {
  await connectDB();
  console.log('--- Synchronizing Avatars across all Collections in Atlas ---');

  const users = await User.find({}).lean();
  console.log(`Found ${users.length} registered users in DB:`);

  for (const u of users) {
    if (!u.primaryUsername || !u.avatar) continue;
    console.log(`Syncing avatar for @${u.primaryUsername} (${u.name})...`);

    // 1. Update all Contact records where username matches
    const contactRes = await Contact.updateMany(
      {
        $or: [
          { username: u.primaryUsername },
          { username: `@${u.primaryUsername}` },
          { username: u.primaryUsername.toLowerCase() },
        ],
      },
      {
        $set: {
          avatar: u.avatar,
          name: u.name,
          status: u.status || 'online',
        },
      }
    );
    console.log(`  - Updated ${contactRes.modifiedCount} contact records.`);

    // 2. Update all Message records where senderUsername matches
    const msgRes = await Message.updateMany(
      {
        $or: [
          { senderUsername: u.primaryUsername },
          { senderUsername: `@${u.primaryUsername}` },
          { senderUsername: u.primaryUsername.toLowerCase() },
        ],
      },
      {
        $set: {
          senderAvatar: u.avatar,
          senderName: u.name,
        },
      }
    );
    console.log(`  - Updated ${msgRes.modifiedCount} message records.`);
  }

  console.log('\n--- VERIFYING ANITA CONTACT IN SOUMYA CHAT ---');
  const anitaContacts = await Contact.find({ username: 'anita' }).lean();
  anitaContacts.forEach((c) => {
    console.log({
      id: c.id,
      ownerId: c.ownerId,
      name: c.name,
      username: c.username,
      hasAvatar: !!c.avatar,
      avatarPrefix: c.avatar ? c.avatar.substring(0, 40) : null,
    });
  });

  const anitaMsgs = await Message.find({ senderUsername: 'anita' }).lean();
  console.log(`Found ${anitaMsgs.length} messages from Anita. All have senderAvatar: ${anitaMsgs.every(m => !!m.senderAvatar)}`);

  console.log('\n✅ All avatars synchronized successfully!');
  process.exit(0);
}

syncAllAvatars().catch((e) => {
  console.error(e);
  process.exit(1);
});
