import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { Contact } from '../models/Contact.js';

async function setupAccounts() {
  await connectDB(5, 2000);
  console.log('Connected to MongoDB Atlas');

  const testAccounts = [
    {
      name: 'Soumya E2EE',
      email: 'soumya.e2ee@test.local',
      primaryUsername: 'soumya.e2ee',
      password: 'Zyntra@2026!E2EE1',
    },
    {
      name: 'Pratyush E2EE',
      email: 'pratyush.e2ee@test.local',
      primaryUsername: 'pratyush.e2ee',
      password: 'Zyntra@2026!E2EE2',
    },
  ];

  const createdOrUpdatedUsers = [];

  for (const acc of testAccounts) {
    let user = await User.findOne({
      $or: [{ email: acc.email }, { primaryUsername: acc.primaryUsername }],
    });

    if (user) {
      console.log(`User exists: ${user.primaryUsername} (${user.email}). Resetting password...`);
      // Update password using bcrypt
      user.password = acc.password; // pre('save') hashes it
      user.name = acc.name;
      user.email = acc.email;
      user.primaryUsername = acc.primaryUsername;
      // Reset public key so browser will re-register its fresh local key on login
      user.publicKey = null;
      user.keyFingerprint = null;
      await user.save();
      console.log(`Password and key state reset for ${user.primaryUsername}`);
      createdOrUpdatedUsers.push(user);
    } else {
      console.log(`Creating user: ${acc.primaryUsername} (${acc.email})...`);
      user = await User.create({
        name: acc.name,
        email: acc.email,
        primaryUsername: acc.primaryUsername,
        password: acc.password,
        bio: 'Local development E2EE test account',
        contexts: [
          {
            id: 'ctx-personal',
            type: 'personal',
            name: 'Personal',
            username: `${acc.primaryUsername}.personal`,
          },
        ],
      });
      console.log(`User created: ${user.primaryUsername}`);
      createdOrUpdatedUsers.push(user);
    }
  }

  // Pre-seed mutual contact record between Soumya and Pratyush with canonical DM ID
  const u1 = createdOrUpdatedUsers[0];
  const u2 = createdOrUpdatedUsers[1];
  const canonicalDmId = 'dm_' + [u1.primaryUsername, u2.primaryUsername].sort().join('_');
  console.log(`Canonical DM ID for test pair: ${canonicalDmId}`);

  // Contact for Soumya pointing to Pratyush
  await Contact.findOneAndUpdate(
    { ownerId: u1._id.toString(), username: u2.primaryUsername },
    {
      id: canonicalDmId,
      ownerId: u1._id.toString(),
      name: u2.name,
      username: u2.primaryUsername,
      avatar: null,
      status: 'online',
      lastMessage: 'Ready for E2EE',
      lastMessageTime: new Date(),
    },
    { upsert: true, new: true }
  );

  // Contact for Pratyush pointing to Soumya
  await Contact.findOneAndUpdate(
    { ownerId: u2._id.toString(), username: u1.primaryUsername },
    {
      id: canonicalDmId,
      ownerId: u2._id.toString(),
      name: u1.name,
      username: u1.primaryUsername,
      avatar: null,
      status: 'online',
      lastMessage: 'Ready for E2EE',
      lastMessageTime: new Date(),
    },
    { upsert: true, new: true }
  );

  // Clean test messages so conversation starts fresh for manual browser testing
  const Message = (await import('../models/Message.js')).default;
  const deletedCount = await Message.deleteMany({ chatId: canonicalDmId });
  console.log(`Cleaned ${deletedCount.deletedCount} prior test messages from ${canonicalDmId}`);

  console.log('Mutual contact records established with canonicalDmId:', canonicalDmId);
  console.log('E2EE test accounts successfully set up.');

  await mongoose.disconnect();
  process.exit(0);
}

setupAccounts().catch((err) => {
  console.error('Setup error:', err);
  process.exit(1);
});
