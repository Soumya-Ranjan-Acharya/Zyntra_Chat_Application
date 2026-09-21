import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { Contact } from '../models/Contact.js';
import { generateArtificialAvatar } from '../../../client/src/utils/artificialAvatars.js';

const NEW_USERS = [
  {
    name: 'Priya Sharma',
    email: 'priya@zyntra.com',
    primaryUsername: 'priya',
    password: 'password123',
    bio: 'Frontend Architect & UI Systems Specialist @ Zyntra',
    avatar: generateArtificialAvatar({ style: 'matrix', auraId: 'matrix', seed: 'priya-matrix' }),
    avatarType: 'ai',
    contexts: [
      { id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'priya.personal' }
    ]
  },
  {
    name: 'Rahul Verma',
    email: 'rahul@zyntra.com',
    primaryUsername: 'rahul',
    password: 'password123',
    bio: 'DevOps & Cloud Infrastructure Lead @ Zyntra',
    avatar: generateArtificialAvatar({ style: 'samurai', auraId: 'ruby', seed: 'rahul-ronin' }),
    avatarType: 'ai',
    contexts: [
      { id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'rahul.personal' }
    ]
  },
  {
    name: 'Aarav Patel',
    email: 'aarav@zyntra.com',
    primaryUsername: 'aarav',
    password: 'password123',
    bio: 'AI Core & Security Architecture Lead @ Zyntra',
    avatar: generateArtificialAvatar({ style: 'android', auraId: 'azure', seed: 'aarav-nexus' }),
    avatarType: 'ai',
    contexts: [
      { id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'aarav.personal' }
    ]
  },
  {
    name: 'Sarah Jenkins',
    email: 'sarah@zyntra.com',
    primaryUsername: 'sarah',
    password: 'password123',
    bio: 'Lead Product Designer & Design Systems @ Zyntra',
    avatar: generateArtificialAvatar({ style: 'hologram', auraId: 'cyan', seed: 'sarah-aether' }),
    avatarType: 'ai',
    contexts: [
      { id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'sarah.personal' }
    ]
  },
  {
    name: 'Alex Chen',
    email: 'alex@zyntra.com',
    primaryUsername: 'alex',
    password: 'password123',
    bio: 'Distributed Systems & Realtime Protocol Engineer @ Zyntra',
    avatar: generateArtificialAvatar({ style: 'pixel', auraId: 'obsidian', seed: 'alex-cipher' }),
    avatarType: 'ai',
    contexts: [
      { id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'alex.personal' }
    ]
  }
];

async function seedUsers() {
  await connectDB();
  console.log('--- Seeding Additional Verified Accounts into MongoDB Atlas ---');

  for (const u of NEW_USERS) {
    const existing = await User.findOne({
      $or: [{ email: u.email }, { primaryUsername: u.primaryUsername }]
    });

    if (existing) {
      console.log(`[EXISTS] User @${u.primaryUsername} (${u.email}) already exists. Updating avatar...`);
      existing.avatar = u.avatar;
      existing.avatarType = 'ai';
      existing.bio = u.bio;
      await existing.save();
    } else {
      const created = await User.create(u);
      console.log(`[CREATED] User ${created.name} (@${created.primaryUsername}) created successfully!`);
    }

    // Sync avatar to any existing contact records referencing this user
    await Contact.updateMany(
      { username: u.primaryUsername },
      { avatar: u.avatar, name: u.name, bio: u.bio }
    );
  }

  // Also verify Anita and Soumya have nice avatars if null
  const anita = await User.findOne({ primaryUsername: 'anita' });
  if (anita && !anita.avatar) {
    anita.avatar = generateArtificialAvatar({ style: 'synth', auraId: 'magenta', seed: 'anita-synth' });
    anita.avatarType = 'ai';
    await anita.save();
    await Contact.updateMany({ username: 'anita' }, { avatar: anita.avatar });
    console.log('[UPDATED] Anita Das equipped with Synthwave AI Avatar.');
  }

  const soumya = await User.findOne({ primaryUsername: 'soumya' });
  if (soumya && !soumya.avatar) {
    soumya.avatar = generateArtificialAvatar({ style: 'astro', auraId: 'violet', seed: 'soumya-astro' });
    soumya.avatarType = 'ai';
    await soumya.save();
    await Contact.updateMany({ username: 'soumya' }, { avatar: soumya.avatar });
    console.log('[UPDATED] Soumya Mohanty equipped with Cosmic Astro AI Avatar.');
  }

  console.log('\n--- ALL REGISTERED ACCOUNTS IN ATLAS ---');
  const allUsers = await User.find({}, 'name email primaryUsername avatar bio').lean();
  console.table(
    allUsers.map((usr) => ({
      Name: usr.name,
      Username: `@${usr.primaryUsername}`,
      Email: usr.email,
      Password: 'password123',
      HasAvatar: Boolean(usr.avatar)
    }))
  );

  console.log('\n✅ User creation complete! All accounts ready.');
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Fatal error seeding users:', err);
  process.exit(1);
});
