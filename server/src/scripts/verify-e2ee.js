import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import { io as ClientIO } from '../../../client/node_modules/socket.io-client/build/esm/index.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Workspace from '../models/Workspace.js';
import WorkspaceNode from '../models/WorkspaceNode.js';
import { Contact } from '../models/Contact.js';
import { setupChatSocket } from '../sockets/chatSocket.js';
import { messageService } from '../services/messageService.js';
import { authorizationService } from '../services/authorizationService.js';

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

// Node.js Web Crypto API (identical to browser window.crypto.subtle)
const { subtle } = globalThis.crypto;

// Helper: base64 converters
function arrayBufferToBase64(buffer) {
  return Buffer.from(buffer).toString('base64');
}

function base64ToArrayBuffer(base64) {
  return Buffer.from(base64, 'base64');
}

function bufferToHexColon(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
}

// Client Crypto Simulator matching client/src/services/encryptionService.js
class ClientCrypto {
  constructor(username) {
    this.username = username;
    this.keyPair = null;
    this.publicKeySpkiBase64 = null;
    this.fingerprint = null;
  }

  async init() {
    this.keyPair = await subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey', 'deriveBits']
    );

    const exportedPublic = await subtle.exportKey('spki', this.keyPair.publicKey);
    this.publicKeySpkiBase64 = arrayBufferToBase64(exportedPublic);

    const digest = await subtle.digest('SHA-256', exportedPublic);
    this.fingerprint = bufferToHexColon(digest.slice(0, 16));
  }

  async deriveSharedKey(peerPublicKeySpkiBase64, chatId) {
    const peerPubKey = await subtle.importKey(
      'spki',
      base64ToArrayBuffer(peerPublicKeySpkiBase64),
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    );

    const sharedBits = await subtle.deriveBits(
      { name: 'ECDH', public: peerPubKey },
      this.keyPair.privateKey,
      256
    );

    const salt = new TextEncoder().encode(`zyntra-dm-${chatId}`);
    const info = new TextEncoder().encode('zyntra-e2ee-message-key-v1');

    const hkdfKey = await subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey']);
    return await subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      hkdfKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plaintext, peerPublicKeySpki, chatId) {
    const key = await this.deriveSharedKey(peerPublicKeySpki, chatId);
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    return {
      ciphertext: arrayBufferToBase64(ciphertextBuffer),
      nonce: arrayBufferToBase64(iv),
      encryptionVersion: 1,
      keyId: this.fingerprint,
    };
  }

  async decrypt(ciphertextBase64, nonceBase64, peerPublicKeySpki, chatId) {
    const key = await this.deriveSharedKey(peerPublicKeySpki, chatId);
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);
    const iv = base64ToArrayBuffer(nonceBase64);

    const decryptedBuffer = await subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  }
}

async function runE2EEVerification() {
  console.log('====================================================');
  console.log('🔒 Zyntra E2EE Messaging Architecture Full Verification');
  console.log('====================================================');

  await connectDB(5, 2000);

  // 1. Create HTTP & Socket.IO server on test port
  const TEST_PORT = 5099;
  const server = http.createServer();
  const io = new Server(server, { cors: { origin: '*' } });
  setupChatSocket(io);

  await new Promise((res) => server.listen(TEST_PORT, res));
  console.log(`Test Socket Server listening on port ${TEST_PORT}`);

  const testSuffix = Date.now().toString().slice(-5);
  const aliceUsername = `alice_${testSuffix}`;
  const rahulUsername = `rahul_${testSuffix}`;
  const eveUsername = `eve_${testSuffix}`;

  // 2. Setup Test Users
  console.log('\n--- 1. Setting up Authenticated Users & Key Material ---');

  const aliceUser = await User.create({
    name: 'Alice Cooper',
    email: `alice_${testSuffix}@zyntra.test`,
    primaryUsername: aliceUsername,
    password: 'Password123!',
  });

  const rahulUser = await User.create({
    name: 'Rahul Sharma',
    email: `rahul_${testSuffix}@zyntra.test`,
    primaryUsername: rahulUsername,
    password: 'Password123!',
  });

  const eveUser = await User.create({
    name: 'Eve Intruder',
    email: `eve_${testSuffix}@zyntra.test`,
    primaryUsername: eveUsername,
    password: 'Password123!',
  });

  const aliceToken = jwt.sign({ id: aliceUser._id }, process.env.JWT_SECRET || 'zyntra_secret_fallback');
  const rahulToken = jwt.sign({ id: rahulUser._id }, process.env.JWT_SECRET || 'zyntra_secret_fallback');
  const eveToken = jwt.sign({ id: eveUser._id }, process.env.JWT_SECRET || 'zyntra_secret_fallback');

  // Initialize Client Cryptography
  const aliceCrypto = new ClientCrypto(aliceUsername);
  const rahulCrypto = new ClientCrypto(rahulUsername);
  await aliceCrypto.init();
  await rahulCrypto.init();

  // Save Public Keys to MongoDB
  aliceUser.publicKey = aliceCrypto.publicKeySpkiBase64;
  aliceUser.keyFingerprint = aliceCrypto.fingerprint;
  await aliceUser.save();

  rahulUser.publicKey = rahulCrypto.publicKeySpkiBase64;
  rahulUser.keyFingerprint = rahulCrypto.fingerprint;
  await rahulUser.save();

  assert(aliceCrypto.fingerprint && aliceCrypto.fingerprint.includes(':'), 'Alice identity key fingerprint derived from real public key');
  assert(rahulCrypto.fingerprint && rahulCrypto.fingerprint.includes(':'), 'Rahul identity key fingerprint derived from real public key');

  // DM Room ID
  const dmChatId = `dm_${[aliceUsername, rahulUsername].sort().join('_')}`;

  // 3. Connect Sockets via authenticated handshake
  console.log('\n--- 2. Socket.IO Authenticated Connections ---');

  const aliceSocket = ClientIO(`http://localhost:${TEST_PORT}`, {
    auth: { token: aliceToken },
    transports: ['websocket'],
  });

  const rahulSocket = ClientIO(`http://localhost:${TEST_PORT}`, {
    auth: { token: rahulToken },
    transports: ['websocket'],
  });

  const eveSocket = ClientIO(`http://localhost:${TEST_PORT}`, {
    auth: { token: eveToken },
    transports: ['websocket'],
  });

  await Promise.all([
    new Promise((res) => aliceSocket.on('connect', res)),
    new Promise((res) => rahulSocket.on('connect', res)),
    new Promise((res) => eveSocket.on('connect', res)),
  ]);

  assert(aliceSocket.connected, 'Alice socket connected with JWT authentication');
  assert(rahulSocket.connected, 'Rahul socket connected with JWT authentication');
  assert(eveSocket.connected, 'Eve socket connected with JWT authentication');

  // 4. Authorization: Room Join Tests
  console.log('\n--- 3. Conversation Membership & Room Join Authorization ---');

  // Alice and Rahul join authorized DM room
  const aliceJoinRes = await new Promise((res) => aliceSocket.emit('join_room', dmChatId, res));
  assert(aliceJoinRes?.success === true, 'Authorized sender Alice successfully joined DM room');

  const rahulJoinRes = await new Promise((res) => rahulSocket.emit('join_room', dmChatId, res));
  assert(rahulJoinRes?.success === true, 'Authorized recipient Rahul successfully joined DM room');

  // Eve (unauthorized) attempts to join Alice & Rahul's DM room
  const eveJoinRes = await new Promise((res) => eveSocket.emit('join_room', dmChatId, res));
  assert(eveJoinRes?.success === false, 'Unauthorized user Eve was REJECTED from joining Alice & Rahul DM room');

  // 5. Verification of "Hello Rahul" E2EE Flow
  console.log('\n--- 4. "Hello Rahul" E2EE Flow Verification ---');

  const testPlaintext = 'Hello Rahul';
  console.log(`  [Sender Action] Encrypting plaintext "${testPlaintext}" on Alice device...`);

  // Sender local encryption
  const encryptedPayload = await aliceCrypto.encrypt(
    testPlaintext,
    rahulUser.publicKey,
    dmChatId
  );

  assert(encryptedPayload.ciphertext && !encryptedPayload.ciphertext.includes(testPlaintext), 'Plaintext is locally encrypted to AES-256-GCM ciphertext');
  assert(encryptedPayload.nonce && encryptedPayload.nonce.length >= 16, 'Random 12-byte nonce/iv generated');

  const messageClientTempId = `temp-test-${Date.now()}`;
  const wirePayload = {
    clientTempId: messageClientTempId,
    chatId: dmChatId,
    chatType: 'direct',
    ciphertext: encryptedPayload.ciphertext,
    nonce: encryptedPayload.nonce,
    encryptionVersion: 1,
    keyId: encryptedPayload.keyId,
    timestamp: new Date().toISOString(),
  };

  // Wire Check: ensure wirePayload contains NO plaintext
  assert(!('content' in wirePayload), 'Network wire: No plaintext content field in message send payload');

  // Recipient listen setup
  const recipientReceivedPromise = new Promise((resolve) => {
    rahulSocket.on('receive_message', (msg) => {
      resolve(msg);
    });
  });

  // Sender transmits over Socket.IO and awaits server ACK
  const sendAck = await new Promise((resolve) => {
    aliceSocket.emit('send_message', wirePayload, (res) => resolve(res));
  });

  assert(sendAck?.success === true, 'Server sent positive ACK for message send');
  assert(sendAck?.clientTempId === messageClientTempId, 'Server ACK preserves clientTempId for optimistic UI reconciliation');
  assert(sendAck?.message?.id, 'Server returned persisted message ID');

  // MongoDB Check: inspect stored message directly in Atlas database
  console.log('\n--- 5. Database Inspection (MongoDB Atlas) ---');
  const storedMessage = await Message.findOne({ id: sendAck.message.id });
  assert(storedMessage !== null, 'Message document exists in MongoDB Atlas');
  assert(storedMessage.content === null, 'MongoDB: message.content is NULL (NO plaintext stored in database)');
  assert(storedMessage.ciphertext === encryptedPayload.ciphertext, 'MongoDB: stores AES-256-GCM ciphertext only');
  assert(storedMessage.nonce === encryptedPayload.nonce, 'MongoDB: stores nonce only');
  assert(storedMessage.senderId === aliceUser._id.toString(), 'MongoDB: senderId derived from authenticated user session (never trusted client)');

  // Recipient Receive & Decryption Check
  console.log('\n--- 6. Recipient Decryption ---');
  const recipientMsg = await recipientReceivedPromise;
  assert(recipientMsg.ciphertext === encryptedPayload.ciphertext, 'Recipient received ciphertext over network');
  assert(recipientMsg.content === null, 'Recipient received null plaintext content over network');

  // Recipient local decryption
  const decryptedText = await rahulCrypto.decrypt(
    recipientMsg.ciphertext,
    recipientMsg.nonce,
    aliceUser.publicKey,
    dmChatId
  );
  assert(decryptedText === testPlaintext, `Recipient successfully decrypted ciphertext to: "${decryptedText}"`);

  // 6. Additional Verifications: Duplicate Prevention
  console.log('\n--- 7. Duplicate Message & Double Write Prevention ---');
  const duplicateSendAck = await new Promise((resolve) => {
    aliceSocket.emit('send_message', { ...wirePayload, id: sendAck.message.id }, (res) => resolve(res));
  });
  assert(duplicateSendAck?.message?.id === sendAck.message.id, 'Duplicate send returned existing message record');
  const countInDb = await Message.countDocuments({ id: sendAck.message.id });
  assert(countInDb === 1, 'Only exactly 1 record exists in MongoDB (double write prevented)');

  // 7. REST History Flow Verification
  console.log('\n--- 8. REST GET History Decryption Flow ---');
  const historyMessages = await messageService.getHistory(rahulUser, dmChatId);
  assert(historyMessages.length >= 1, 'REST history returned stored messages');
  const targetHistoryMsg = historyMessages.find((m) => m.id === sendAck.message.id);
  assert(targetHistoryMsg.ciphertext === encryptedPayload.ciphertext, 'REST history serves ciphertext only');
  assert(targetHistoryMsg.content === null, 'REST history does not leak plaintext');

  const historyDecrypted = await rahulCrypto.decrypt(
    targetHistoryMsg.ciphertext,
    targetHistoryMsg.nonce,
    aliceUser.publicKey,
    dmChatId
  );
  assert(historyDecrypted === 'Hello Rahul', 'Client successfully decrypts message fetched from REST history');

  // 8. Encrypted Edit Flow Verification
  console.log('\n--- 9. Encrypted Edit Flow ---');
  const editedPlaintext = 'Hello Rahul (edited)';
  const editedEncrypted = await aliceCrypto.encrypt(
    editedPlaintext,
    rahulUser.publicKey,
    dmChatId
  );

  const editAck = await new Promise((resolve) => {
    aliceSocket.emit('edit_message', {
      messageId: sendAck.message.id,
      chatId: dmChatId,
      ciphertext: editedEncrypted.ciphertext,
      nonce: editedEncrypted.nonce,
    }, (res) => resolve(res));
  });

  assert(editAck?.success === true, 'Server acknowledged encrypted edit');
  const editedInDb = await Message.findOne({ id: sendAck.message.id });
  assert(editedInDb.isEdited === true, 'MongoDB: isEdited marked true');
  assert(editedInDb.content === null, 'MongoDB: plaintext content remains NULL after edit');
  assert(editedInDb.ciphertext === editedEncrypted.ciphertext, 'MongoDB: ciphertext updated to new encrypted content');

  const decryptedEdited = await rahulCrypto.decrypt(
    editedInDb.ciphertext,
    editedInDb.nonce,
    aliceUser.publicKey,
    dmChatId
  );
  assert(decryptedEdited === editedPlaintext, `Recipient decrypts edited message to: "${decryptedEdited}"`);

  // 9. Personal vs Workplace Context Isolation
  console.log('\n--- 10. Personal / Workplace Context Isolation ---');
  const testWorkspaceNodeId = `chan-secret-${testSuffix}`;
  await WorkspaceNode.create({
    id: testWorkspaceNodeId,
    workspaceId: `ws-secret-${testSuffix}`,
    name: 'Secret Channel',
    members: [{ id: aliceUser._id.toString(), name: 'Alice', username: aliceUsername }],
    joinCode: `ZYN-SEC-${testSuffix}`,
  });

  // Eve attempts to send to secret channel
  let eveSendFailed = false;
  try {
    await messageService.saveMessage(eveUser, {
      chatId: testWorkspaceNodeId,
      ciphertext: 'fakeCiphertext',
      nonce: 'fakeNonce',
    });
  } catch (err) {
    eveSendFailed = true;
  }
  assert(eveSendFailed, 'Unauthorized user Eve blocked from writing to private workspace channel');

  // 10. Clean Teardown
  console.log('\n--- 11. Cleanup ---');
  aliceSocket.disconnect();
  rahulSocket.disconnect();
  eveSocket.disconnect();
  server.close();

  await User.deleteMany({ _id: { $in: [aliceUser._id, rahulUser._id, eveUser._id] } });
  await Message.deleteMany({ chatId: { $in: [dmChatId, testWorkspaceNodeId] } });
  await WorkspaceNode.deleteOne({ id: testWorkspaceNodeId });

  console.log('Cleanup completed cleanly.');

  // Summary
  console.log('\n====================================================');
  console.log(`E2EE VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runE2EEVerification().catch((err) => {
  console.error('Fatal E2EE test error:', err);
  process.exit(1);
});
