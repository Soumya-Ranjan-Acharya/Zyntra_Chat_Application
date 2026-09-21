import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import WorkspaceNode from '../models/WorkspaceNode.js';
import Message from '../models/Message.js';
import { Contact, PersonalGroup } from '../models/Contact.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting Zyntra Backend Full Verification Suite');
  console.log('----------------------------------------------------');

  await connectDB(5, 2000);
  console.log('Connected to MongoDB Atlas: ', mongoose.connection.name);

  const testSuffix = Date.now().toString().slice(-5);
  const testUserEmail = `testuser_${testSuffix}@example.com`;
  const testUsername = `user_${testSuffix}`;
  const testPassword = 'SecurePassword123!';

  // ==========================================
  // 1. ACCOUNT CREATION (REGISTRATION)
  // ==========================================
  console.log('\n--- 1. Account Creation & Registration Tests ---');
  
  // Test 1.1: Register new unique user
  const newUser = await User.create({
    name: `Test User ${testSuffix}`,
    email: testUserEmail,
    primaryUsername: testUsername,
    password: testPassword,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=test',
    avatarType: 'ai',
    bio: 'Tester exploring Zyntra contextual communication',
    contexts: [
      {
        id: 'ctx-personal',
        type: 'personal',
        name: 'Personal',
        username: `${testUsername}.personal`,
      },
    ],
  });

  assert(newUser && newUser._id, 'User account successfully created in Atlas');
  assert(newUser.email === testUserEmail, 'Email properly normalized and stored');
  assert(newUser.primaryUsername === testUsername, 'Primary username properly stored');
  assert(newUser.password !== testPassword, 'Password is secure bcrypt hash, not plaintext');

  // Test 1.2: Password hashing verification
  const isMatch = await newUser.matchPassword(testPassword);
  assert(isMatch === true, 'bcrypt password match validation succeeds');
  const isBadMatch = await newUser.matchPassword('WrongPassword999');
  assert(isBadMatch === false, 'bcrypt password match rejects incorrect password');

  // Test 1.3: Duplicate Email Prevention
  let dupEmailFailed = false;
  try {
    await User.create({
      name: 'Duplicate Email Tester',
      email: testUserEmail,
      primaryUsername: `other_${testSuffix}`,
      password: 'password123',
    });
  } catch (err) {
    dupEmailFailed = true;
  }
  assert(dupEmailFailed, 'Duplicate email correctly rejected by MongoDB unique constraint');

  // Test 1.4: Duplicate Primary Username Prevention
  let dupUsernameFailed = false;
  try {
    await User.create({
      name: 'Duplicate User Tester',
      email: `another_${testSuffix}@example.com`,
      primaryUsername: testUsername,
      password: 'password123',
    });
  } catch (err) {
    dupUsernameFailed = true;
  }
  assert(dupUsernameFailed, 'Duplicate primaryUsername correctly rejected by MongoDB unique constraint');

  // ==========================================
  // 2. USER PROFILE & CONTEXTS
  // ==========================================
  console.log('\n--- 2. Profile Updates & Contexts Tests ---');
  
  // Update bio and name
  const updatedUser = await User.findByIdAndUpdate(
    newUser._id,
    { name: `Updated Name ${testSuffix}`, bio: 'Updated bio testing' },
    { new: true }
  );
  assert(updatedUser.name === `Updated Name ${testSuffix}`, 'User name update persisted');
  assert(updatedUser.bio === 'Updated bio testing', 'User bio update persisted');

  // Add workplace context
  updatedUser.contexts.push({
    id: 'ctx-work-test',
    type: 'workplace',
    name: 'GIET University',
    username: `${testUsername}.giet`,
  });
  await updatedUser.save();
  assert(updatedUser.contexts.length === 2, 'Workplace context appended and persisted');

  // ==========================================
  // 3. WORKSPACES & HIERARCHY NODES
  // ==========================================
  console.log('\n--- 3. Workspaces & Hierarchy Tree Tests ---');

  const wsId = `ws-test-${testSuffix}`;
  const rootNodeId = `root-${wsId}`;
  const defaultChannelId = `chan-gen-${wsId}`;
  const rootJoinCode = `ZYN-TEST-${testSuffix}`;
  const channelJoinCode = `ZYN-CHAN-${testSuffix}`;

  // Create Root Node
  const rootNode = await WorkspaceNode.create({
    id: rootNodeId,
    workspaceId: wsId,
    name: `Test Org ${testSuffix}`,
    parentId: null,
    children: [defaultChannelId],
    memberCount: 1,
    hasConversation: true,
    joinCode: rootJoinCode,
    description: 'Root workspace node for verification',
    createdBy: newUser._id,
  });
  assert(rootNode && rootNode.joinCode === rootJoinCode, 'Root workspace node created');

  // Create General Channel Node
  const generalNode = await WorkspaceNode.create({
    id: defaultChannelId,
    workspaceId: wsId,
    name: 'General Discussions',
    parentId: rootNodeId,
    children: [],
    memberCount: 1,
    hasConversation: true,
    joinCode: channelJoinCode,
    description: 'General channel discussions',
    createdBy: newUser._id,
  });
  assert(generalNode && generalNode.id === defaultChannelId, 'Default channel node created');

  // Create Workspace Record
  const newWorkspace = await Workspace.create({
    id: wsId,
    name: `Test Org ${testSuffix}`,
    rootNodeId,
    defaultNodeId: defaultChannelId,
    type: 'organization',
    memberCount: 1,
    owner: newUser._id,
    creatorName: newUser.name,
    contextualUsername: `${testUsername}.testorg`,
  });
  assert(newWorkspace && newWorkspace.id === wsId, 'Workspace record saved and linked to nodes');

  // Create Sub-group (e.g., Capstone Project Team)
  const subNodeId = `sub-proj-${testSuffix}`;
  const subJoinCode = `ZYN-PROJ-${testSuffix}`;
  const subNode = await WorkspaceNode.create({
    id: subNodeId,
    workspaceId: wsId,
    name: 'Autonomous AI Agent Capstone',
    parentId: defaultChannelId,
    children: [],
    memberCount: 1,
    hasConversation: true,
    joinCode: subJoinCode,
    description: 'Capstone team project sub-channel',
    createdBy: newUser._id,
  });

  generalNode.children.push(subNodeId);
  await generalNode.save();
  assert(subNode && subNode.parentId === defaultChannelId, 'Sub-group node created under parent');
  assert(generalNode.children.includes(subNodeId), 'Parent node updated with child reference');

  // Join by JoinCode verification
  const foundNode = await WorkspaceNode.findOne({ joinCode: subJoinCode });
  assert(foundNode && foundNode.id === subNodeId, 'Join by code finds target node');
  foundNode.memberCount += 1;
  await foundNode.save();
  assert(foundNode.memberCount === 2, 'Join by code increments memberCount');

  // ==========================================
  // 4. MESSAGES & REAL-TIME CHAT
  // ==========================================
  console.log('\n--- 4. Messaging & Reactions Tests ---');

  const msgId = `msg-test-${testSuffix}`;
  const msgContent = `Hello Zyntra team! Automated test message ${testSuffix}`;

  // Send message
  const createdMsg = await Message.create({
    id: msgId,
    chatId: subNodeId,
    chatType: 'workspace-node',
    senderId: newUser._id.toString(),
    senderName: newUser.name,
    content: msgContent,
    type: 'text',
    reactions: [],
    timestamp: new Date(),
  });
  assert(createdMsg && createdMsg.id === msgId, 'Message persisted to MongoDB Atlas');

  // Fetch messages by chatId
  const fetchedMessages = await Message.find({ chatId: subNodeId });
  assert(fetchedMessages.length > 0, 'Fetched messages for chat room successfully');
  assert(fetchedMessages.some((m) => m.id === msgId), 'Message found in chat history query');

  // Add Reaction
  createdMsg.reactions.push({
    emoji: '🚀',
    count: 1,
    users: [newUser._id.toString()],
  });
  await createdMsg.save();
  const reloadedMsg = await Message.findOne({ id: msgId });
  assert(reloadedMsg.reactions[0].emoji === '🚀', 'Emoji reaction persisted to message');

  // Edit Message
  reloadedMsg.content = `${msgContent} (edited)`;
  reloadedMsg.isEdited = true;
  await reloadedMsg.save();
  const editedMsg = await Message.findOne({ id: msgId });
  assert(editedMsg.isEdited === true && editedMsg.content.includes('(edited)'), 'Message edit persisted');

  // ==========================================
  // 5. CONTACTS & PERSONAL GROUPS
  // ==========================================
  console.log('\n--- 5. Contacts & Personal Groups Tests ---');

  const contactId = `contact-test-${testSuffix}`;
  const newContact = await Contact.create({
    id: contactId,
    ownerId: newUser._id.toString(),
    name: 'Priya Sharma',
    username: 'priya.sharma',
    bio: 'Research Colleague',
    status: 'online',
    lastMessage: 'Let us sync up',
    lastMessageTime: new Date(),
  });
  assert(newContact && newContact.id === contactId, 'Personal contact persisted to Atlas');

  const groupId = `group-test-${testSuffix}`;
  const newGroup = await PersonalGroup.create({
    id: groupId,
    name: 'AI Study Group',
    description: 'Weekly paper discussions',
    membersCount: 4,
    lastMessage: 'Paper link shared',
    lastMessageTime: new Date(),
    creatorId: newUser._id.toString(),
  });
  assert(newGroup && newGroup.id === groupId, 'Personal group persisted to Atlas');

  // Cleanup test artifacts
  console.log('\n--- Cleaning up temporary test artifacts ---');
  await User.deleteOne({ _id: newUser._id });
  await Workspace.deleteOne({ id: wsId });
  await WorkspaceNode.deleteMany({ workspaceId: wsId });
  await Message.deleteOne({ id: msgId });
  await Contact.deleteOne({ id: contactId });
  await PersonalGroup.deleteOne({ id: groupId });
  console.log('Cleanup completed cleanly.');

  // ==========================================
  // SUMMARY REPORT
  // ==========================================
  console.log('\n====================================================');
  console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
