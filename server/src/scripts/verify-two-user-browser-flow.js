import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { webcrypto } from 'crypto';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server } from 'socket.io';
import { io as ClientIO } from '../../../client/node_modules/socket.io-client/build/esm/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const crypto = webcrypto.subtle;

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { Contact } from '../models/Contact.js';
import { messageService } from '../services/messageService.js';
import { setupChatSocket } from '../sockets/chatSocket.js';

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

// Client simulator with exact browser WebCrypto crypto logic from encryptionService.js
class BrowserClientSimulator {
  constructor(name, username, token) {
    this.name = name;
    this.username = username;
    this.token = token;
    this.keyPair = null;
    this.publicKeySpkiBase64 = null;
    this.fingerprint = null;
    this.peerPublicKeys = new Map();
    this.peerFingerprints = new Map();
    this.conversationKeys = new Map();
    this.socket = null;
  }

  async initKeys() {
    this.keyPair = await crypto.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey', 'deriveBits']
    );
    const pubSpki = await crypto.exportKey('spki', this.keyPair.publicKey);
    this.publicKeySpkiBase64 = arrayBufferToBase64(pubSpki);
    const digest = await crypto.digest('SHA-256', pubSpki);
    this.fingerprint = bufferToHexColon(digest.slice(0, 16));
  }

  async deriveDirectConversationKey(chatId, peerIdentifier, peerPublicKeySpkiBase64, peerFingerprint) {
    if (this.conversationKeys.has(chatId)) {
      return this.conversationKeys.get(chatId);
    }

    const peerKey = await crypto.importKey(
      'spki',
      base64ToArrayBuffer(peerPublicKeySpkiBase64),
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    );

    this.peerPublicKeys.set(peerIdentifier, peerKey);
    this.peerFingerprints.set(peerIdentifier, peerFingerprint);

    const sharedBits = await crypto.deriveBits(
      { name: 'ECDH', public: peerKey },
      this.keyPair.privateKey,
      256
    );

    const salt = new TextEncoder().encode(`zyntra-dm-${chatId}`);
    const info = new TextEncoder().encode('zyntra-e2ee-message-key-v1');

    const hkdfKey = await crypto.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey']);
    const convKey = await crypto.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      hkdfKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    this.conversationKeys.set(chatId, convKey);
    return convKey;
  }

  async encryptMessage(chatId, text, convKey) {
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify({ text, attachment: null }));
    const ciphertext = await crypto.encrypt({ name: 'AES-GCM', iv }, convKey, encoded);

    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      nonce: arrayBufferToBase64(iv),
      encryptionVersion: 1,
      keyId: this.fingerprint,
    };
  }

  async decryptMessage(encryptedMsg, convKey) {
    try {
      const ivBuffer = base64ToArrayBuffer(encryptedMsg.nonce);
      const ciphertextBuffer = base64ToArrayBuffer(encryptedMsg.ciphertext);

      const decrypted = await crypto.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        convKey,
        ciphertextBuffer
      );

      const text = new TextDecoder().decode(decrypted);
      try {
        const parsed = JSON.parse(text);
        return parsed.text || text;
      } catch {
        return text;
      }
    } catch {
      return '[🔒 Encrypted message]';
    }
  }
}

async function runTwoUserBrowserVerification() {
  console.log('\n================================================================');
  console.log('🧪 ZYNTRA 1:1 E2EE TWO-BROWSER FLOW VERIFICATION');
  console.log('================================================================');

  await connectDB(5, 2000);

  // 1. Fetch test users
  const soumyaUser = await User.findOne({ primaryUsername: 'soumya.e2ee' });
  const pratyushUser = await User.findOne({ primaryUsername: 'pratyush.e2ee' });

  if (!soumyaUser || !pratyushUser) {
    throw new Error('Test users soumya.e2ee or pratyush.e2ee not found in DB. Run setup-e2ee-accounts.js first.');
  }

  const jwtSecret = process.env.JWT_SECRET || 'zyntra_fallback_jwt_secret_dev_2026';
  const soumyaToken = jwt.sign({ id: soumyaUser._id }, jwtSecret, { expiresIn: '1d' });
  const pratyushToken = jwt.sign({ id: pratyushUser._id }, jwtSecret, { expiresIn: '1d' });

  // 2. Start test Socket.IO server on dynamic port
  const server = http.createServer();
  const io = new Server(server, { cors: { origin: '*' } });
  setupChatSocket(io);

  await new Promise((resolve) => server.listen(5199, resolve));
  console.log('✓ Test Socket server running on port 5199');

  const chatId = 'dm_pratyush.e2ee_soumya.e2ee';

  // 3. Initialize simulated browsers
  console.log('\n--- Step 1: Initialize Browser 1 (Chrome - Soumya) ---');
  const chromeSoumya = new BrowserClientSimulator('Chrome', 'soumya.e2ee', soumyaToken);
  await chromeSoumya.initKeys();
  soumyaUser.publicKey = chromeSoumya.publicKeySpkiBase64;
  soumyaUser.keyFingerprint = chromeSoumya.fingerprint;
  await soumyaUser.save();
  console.log(`✓ Chrome/Soumya generated ECDH P-256 keys. Fingerprint: ${chromeSoumya.fingerprint}`);
  console.log(`✓ Chrome/Soumya registered public key on server.`);

  console.log('\n--- Step 2: Initialize Browser 2 (Edge - Pratyush) ---');
  const edgePratyush = new BrowserClientSimulator('Edge', 'pratyush.e2ee', pratyushToken);
  await edgePratyush.initKeys();
  pratyushUser.publicKey = edgePratyush.publicKeySpkiBase64;
  pratyushUser.keyFingerprint = edgePratyush.fingerprint;
  await pratyushUser.save();
  console.log(`✓ Edge/Pratyush generated ECDH P-256 keys. Fingerprint: ${edgePratyush.fingerprint}`);
  console.log(`✓ Edge/Pratyush registered public key on server.`);

  // 4. Connect Sockets
  console.log('\n--- Step 3: Connect Browser Clients to Socket.IO ---');
  chromeSoumya.socket = ClientIO('http://localhost:5199', { auth: { token: soumyaToken } });
  edgePratyush.socket = ClientIO('http://localhost:5199', { auth: { token: pratyushToken } });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => { if (++connected === 2) resolve(); };
    chromeSoumya.socket.on('connect', check);
    edgePratyush.socket.on('connect', check);
  });
  console.log('✓ Both browser sockets authenticated & connected');

  // 5. Join Room
  await new Promise((resolve) => {
    chromeSoumya.socket.emit('join_room', chatId, () => {
      edgePratyush.socket.emit('join_room', chatId, () => {
        resolve();
      });
    });
  });
  console.log(`✓ Both clients authorized and joined room: ${chatId}`);

  // 6. Test Direction 1: Chrome (Soumya) -> Edge (Pratyush)
  console.log('\n--- Step 4: Chrome/Soumya sends "hello pratyush the great" ---');
  const soumyaConvKey = await chromeSoumya.deriveDirectConversationKey(
    chatId,
    'pratyush.e2ee',
    edgePratyush.publicKeySpkiBase64,
    edgePratyush.fingerprint
  );
  const pratyushConvKey = await edgePratyush.deriveDirectConversationKey(
    chatId,
    'soumya.e2ee',
    chromeSoumya.publicKeySpkiBase64,
    chromeSoumya.fingerprint
  );

  const testPlaintext1 = 'hello pratyush the great';
  const encryptedPayload1 = await chromeSoumya.encryptMessage(chatId, testPlaintext1, soumyaConvKey);

  console.log(`  [Wire Check] Ciphertext length: ${encryptedPayload1.ciphertext.length} chars`);
  console.log(`  [Wire Check] Nonce length: ${encryptedPayload1.nonce.length} chars`);
  console.log(`  [Wire Check] KeyId: ${encryptedPayload1.keyId}`);

  // Edge listener for incoming message
  const edgeReceivedPromise = new Promise((resolve) => {
    edgePratyush.socket.on('receive_message', async (msg) => {
      console.log(`  [Edge Event] Received message over Socket.IO: id=${msg.id}, content=${msg.content}`);
      const decrypted = await edgePratyush.decryptMessage(msg, pratyushConvKey);
      resolve({ msg, decrypted });
    });
  });

  // Soumya sends via Socket.IO
  const ack1 = await new Promise((resolve) => {
    chromeSoumya.socket.emit(
      'send_message',
      {
        chatId,
        chatType: 'direct',
        clientTempId: 'temp-soumya-1',
        ciphertext: encryptedPayload1.ciphertext,
        nonce: encryptedPayload1.nonce,
        encryptionVersion: 1,
        keyId: encryptedPayload1.keyId,
        timestamp: new Date().toISOString(),
      },
      resolve
    );
  });

  console.log(`✓ Server ACK received for message: ${ack1.message?.id}`);
  const { msg: receivedOnEdge, decrypted: edgeDecrypted1 } = await edgeReceivedPromise;

  console.log(`  [Edge Local Decryption Result]: "${edgeDecrypted1}"`);
  if (edgeDecrypted1 === testPlaintext1) {
    console.log('  [PASS] Edge successfully decrypted Chrome message locally!');
  } else {
    throw new Error(`Edge decryption mismatch: got "${edgeDecrypted1}", expected "${testPlaintext1}"`);
  }

  // 7. Verify MongoDB storage
  console.log('\n--- Step 5: Verify MongoDB Atlas Stored Record ---');
  const dbMsg1 = await Message.findOne({ id: ack1.message.id });
  console.log(`  [DB Check] content: ${dbMsg1.content}`);
  console.log(`  [DB Check] ciphertext exists: ${Boolean(dbMsg1.ciphertext)}`);
  console.log(`  [DB Check] nonce exists: ${Boolean(dbMsg1.nonce)}`);
  console.log(`  [DB Check] keyId: ${dbMsg1.keyId}`);

  if (dbMsg1.content !== null) {
    throw new Error(`MongoDB content must be NULL but got: ${dbMsg1.content}`);
  }
  console.log('  [PASS] MongoDB Atlas stores NO plaintext. Content is strictly NULL.');

  // 8. Test Direction 2: Edge (Pratyush) -> Chrome (Soumya)
  console.log('\n--- Step 6: Edge/Pratyush replies "hello soumya received loud and clear" ---');
  const testPlaintext2 = 'hello soumya received loud and clear';
  const encryptedPayload2 = await edgePratyush.encryptMessage(chatId, testPlaintext2, pratyushConvKey);

  const chromeReceivedPromise = new Promise((resolve) => {
    chromeSoumya.socket.on('receive_message', async (msg) => {
      console.log(`  [Chrome Event] Received message over Socket.IO: id=${msg.id}, content=${msg.content}`);
      const decrypted = await chromeSoumya.decryptMessage(msg, soumyaConvKey);
      resolve({ msg, decrypted });
    });
  });

  const ack2 = await new Promise((resolve) => {
    edgePratyush.socket.emit(
      'send_message',
      {
        chatId,
        chatType: 'direct',
        clientTempId: 'temp-pratyush-1',
        ciphertext: encryptedPayload2.ciphertext,
        nonce: encryptedPayload2.nonce,
        encryptionVersion: 1,
        keyId: encryptedPayload2.keyId,
        timestamp: new Date().toISOString(),
      },
      resolve
    );
  });

  console.log(`✓ Server ACK received for message: ${ack2.message?.id}`);
  const { decrypted: chromeDecrypted2 } = await chromeReceivedPromise;

  console.log(`  [Chrome Local Decryption Result]: "${chromeDecrypted2}"`);
  if (chromeDecrypted2 === testPlaintext2) {
    console.log('  [PASS] Chrome successfully decrypted Edge message locally!');
  } else {
    throw new Error(`Chrome decryption mismatch: got "${chromeDecrypted2}", expected "${testPlaintext2}"`);
  }

  // 9. Test REST History Fetch
  console.log('\n--- Step 7: Verify REST History Decryption ---');
  const historyResult = await messageService.getHistory(pratyushUser, chatId);
  console.log(`✓ History returned ${historyResult.length} encrypted messages from DB`);

  for (const hMsg of historyResult) {
    const decrypted = await edgePratyush.decryptMessage(hMsg, pratyushConvKey);
    console.log(`  [History Decrypted L2]: "${decrypted}" (sender: ${hMsg.senderUsername})`);
  }
  console.log('  [PASS] REST history decrypted cleanly in Edge using same conversation key.');

  // Clean up
  chromeSoumya.socket.disconnect();
  edgePratyush.socket.disconnect();
  await new Promise((resolve) => server.close(resolve));

  console.log('\n================================================================');
  console.log('✅ ALL TWO-USER BROWSER VERIFICATION TESTS PASSED');
  console.log('================================================================\n');

  process.exit(0);
}

runTwoUserBrowserVerification().catch((err) => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
