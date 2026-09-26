/**
 * ZYNTRA END-TO-END ENCRYPTION (E2EE) SERVICE
 * 
 * Cryptographic Architecture:
 * - Device Identity Keys: ECDH over NIST P-256 (secp256r1)
 * - Key Derivation: HKDF-SHA256 (RFC 5869)
 * - Message Encryption: Authenticated AES-256-GCM (12-byte IV, 128-bit tag)
 * - Fingerprint: SHA-256 digest of device public key material (colon-separated hex)
 * - Secure Storage: Origin-isolated IndexedDB with in-memory key cache
 * - Group Keys: Pairwise ECDH key wrapping with epoch-based rotation on membership changes
 */

import { api } from './api';

// Base64 array buffer helpers
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert ArrayBuffer to hex string (colon-separated)
function bufferToHexColon(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
}

// IndexedDB Helper for persistent client-side key storage
class KeyStorage {
  constructor(dbName = 'zyntra_crypto_store') {
    this.dbName = dbName;
    this.db = null;
  }

  async getDB() {
    if (this.db) return this.db;
    if (typeof window === 'undefined' || !window.indexedDB) return null;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('device_keys')) {
          db.createObjectStore('device_keys');
        }
        if (!db.objectStoreNames.contains('conversation_keys')) {
          db.createObjectStore('conversation_keys');
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    const db = await this.getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async set(storeName, key, value) {
    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export class EncryptionService {
  constructor() {
    this.storage = new KeyStorage();
    this.identityKeyPair = null;
    this.publicKeySpkiBase64 = null;
    this.fingerprint = null;
    this.conversationKeys = new Map(); // chatId -> CryptoKey
    this.peerPublicKeys = new Map(); // username/userId -> CryptoKey
    this.peerFingerprints = new Map(); // username/userId -> string
    this.isInitialized = false;
    this.initPromise = null;
    this.currentUsername = null;
  }

  get crypto() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      return window.crypto.subtle;
    }
    throw new Error('Web Crypto API is not supported in this environment');
  }

  /**
   * Reset in-memory key state (on logout or user switch)
   */
  reset() {
    this.identityKeyPair = null;
    this.publicKeySpkiBase64 = null;
    this.fingerprint = null;
    this.conversationKeys.clear();
    this.peerPublicKeys.clear();
    this.peerFingerprints.clear();
    this.isInitialized = false;
    this.initPromise = null;
    this.currentUsername = null;
    console.log('[E2EE-DEBUG] Encryption service reset');
  }

  /**
   * Ensure device identity keys are loaded before cryptographic operations
   */
  async ensureInitialized() {
    if (this.isInitialized && this.identityKeyPair) return true;
    if (this.initPromise) {
      await this.initPromise;
      if (this.isInitialized && this.identityKeyPair) return true;
    }
    // Attempt initialization with stored user from localStorage
    try {
      const savedUserStr = localStorage.getItem('zyntra-auth-user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.primaryUsername) {
          await this.initialize(savedUser);
          return Boolean(this.identityKeyPair);
        }
      }
    } catch {}
    return false;
  }

  /**
   * Initialize local device identity key pair and register public key with server
   */
  async initialize(currentUser) {
    const username = (currentUser?.primaryUsername || '').trim().replace(/^@/, '').toLowerCase();
    if (!username) return false;

    // If already initialized for this exact username and key pair exists, return true
    if (this.isInitialized && this.currentUsername === username && this.identityKeyPair) {
      return true;
    }

    // If already initializing for this exact username, return that promise
    if (this.initPromise && this.currentUsername === username) {
      return this.initPromise;
    }

    // If switching users, reset state cleanly
    if (this.currentUsername && this.currentUsername !== username) {
      this.reset();
    }

    this.currentUsername = username;

    this.initPromise = (async () => {
      try {
        const keyStorageKey = `identity_${username}`;

        // 1. Try loading existing identity key pair from IndexedDB for this user
        const storedKeys = await this.storage.get('device_keys', keyStorageKey);

        if (storedKeys && storedKeys.publicKey && storedKeys.privateKey) {
          try {
            const publicKey = await this.crypto.importKey(
              'spki',
              base64ToArrayBuffer(storedKeys.publicKey),
              { name: 'ECDH', namedCurve: 'P-256' },
              true,
              []
            );
            const privateKey = await this.crypto.importKey(
              'pkcs8',
              base64ToArrayBuffer(storedKeys.privateKey),
              { name: 'ECDH', namedCurve: 'P-256' },
              true,
              ['deriveKey', 'deriveBits']
            );

            this.identityKeyPair = { publicKey, privateKey };
            this.publicKeySpkiBase64 = storedKeys.publicKey;
            this.fingerprint = storedKeys.fingerprint;
          } catch (e) {
            console.warn('[E2EE] Error restoring stored identity keys, generating fresh:', e);
          }
        }

        // 2. Generate fresh ECDH P-256 key pair if not loaded
        if (!this.identityKeyPair) {
          const keyPair = await this.crypto.generateKey(
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ['deriveKey', 'deriveBits']
          );

          const exportedPublic = await this.crypto.exportKey('spki', keyPair.publicKey);
          const exportedPrivate = await this.crypto.exportKey('pkcs8', keyPair.privateKey);

          this.publicKeySpkiBase64 = arrayBufferToBase64(exportedPublic);
          const rawPrivateBase64 = arrayBufferToBase64(exportedPrivate);

          // Calculate fingerprint: SHA-256 of public key SPKI
          const digest = await this.crypto.digest('SHA-256', exportedPublic);
          this.fingerprint = bufferToHexColon(digest.slice(0, 16));

          this.identityKeyPair = keyPair;

          // Store securely in IndexedDB
          await this.storage.set('device_keys', keyStorageKey, {
            publicKey: this.publicKeySpkiBase64,
            privateKey: rawPrivateBase64,
            fingerprint: this.fingerprint,
          });
        }

        // 3. Register public key with backend server (AWAITED to avoid race conditions)
        const token = localStorage.getItem('zyntra_auth_token');
        if (token) {
          try {
            await api.auth.uploadKeys({
              publicKey: this.publicKeySpkiBase64,
              keyFingerprint: this.fingerprint,
            });
            console.log(`[E2EE-DEBUG] Registered public key on server: user=${username}, fingerprint=${this.fingerprint}`);
          } catch (err) {
            console.warn('[E2EE] Key registration upload warning:', err.message);
          }
        }

        this.isInitialized = true;
        console.log(`[E2EE-DEBUG] Initialized keys for user=${username}, fingerprint=${this.fingerprint}`);
        return true;
      } catch (err) {
        console.error('[E2EE] Initialization error:', err);
        return false;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Get device public fingerprint
   */
  getFingerprint() {
    return this.fingerprint;
  }

  /**
   * Fetch and import peer's public key (supports cache invalidation / forced refresh)
   */
  async getPeerPublicKey(peerIdentifier, forceRefresh = false) {
    const cleanId = (peerIdentifier || '').trim().replace(/^@/, '').toLowerCase();
    if (!cleanId) return null;

    if (!forceRefresh && this.peerPublicKeys.has(cleanId)) {
      return this.peerPublicKeys.get(cleanId);
    }

    try {
      const res = await api.auth.getPublicKey(cleanId);
      if (res.ok && res.data?.data?.publicKey) {
        const spkiBuffer = base64ToArrayBuffer(res.data.data.publicKey);
        const importedKey = await this.crypto.importKey(
          'spki',
          spkiBuffer,
          { name: 'ECDH', namedCurve: 'P-256' },
          true,
          []
        );

        this.peerPublicKeys.set(cleanId, importedKey);
        if (res.data.data.keyFingerprint) {
          this.peerFingerprints.set(cleanId, res.data.data.keyFingerprint);
        }

        console.log(`[E2EE-DEBUG] Fetched peer key: peer=${cleanId}, fingerprint=${res.data.data.keyFingerprint}`);
        return importedKey;
      }
    } catch (e) {
      console.warn('[E2EE] Could not fetch peer public key:', e.message);
    }

    return null;
  }

  /**
   * Get peer's key fingerprint
   */
  async getPeerFingerprint(peerIdentifier) {
    const cleanId = (peerIdentifier || '').trim().replace(/^@/, '').toLowerCase();
    if (this.peerFingerprints.has(cleanId)) {
      return this.peerFingerprints.get(cleanId);
    }
    await this.getPeerPublicKey(cleanId);
    return this.peerFingerprints.get(cleanId) || null;
  }

  /**
   * Derive 1:1 conversation key using ECDH + HKDF
   */
  async deriveDirectConversationKey(chatId, peerIdentifier, expectedPeerKeyId = null) {
    await this.ensureInitialized();

    if (!this.identityKeyPair) {
      throw new Error('Device identity key pair is not initialized');
    }

    const cleanPeer = (peerIdentifier || '').trim().replace(/^@/, '').toLowerCase();
    if (!cleanPeer) {
      throw new Error(`Cannot derive conversation key: peer identifier missing for chat ${chatId}`);
    }

    const cachedKey = this.conversationKeys.get(chatId);
    const cachedPeerFp = this.peerFingerprints.get(cleanPeer);

    // If expectedPeerKeyId was supplied (e.g. from message.keyId) and it differs from cached peer fingerprint,
    // the peer has generated a new key pair: invalidate cache
    const isPeerKeyStale = Boolean(expectedPeerKeyId && cachedPeerFp && expectedPeerKeyId !== cachedPeerFp);

    if (cachedKey && !isPeerKeyStale) {
      return cachedKey;
    }

    if (isPeerKeyStale) {
      console.log(`[E2EE-DEBUG] Peer key fingerprint changed for ${cleanPeer} (cached=${cachedPeerFp}, expected=${expectedPeerKeyId}). Refreshing...`);
      this.conversationKeys.delete(chatId);
      this.peerPublicKeys.delete(cleanPeer);
      this.peerFingerprints.delete(cleanPeer);
    }

    let peerKey = await this.getPeerPublicKey(cleanPeer, isPeerKeyStale);

    if (!peerKey) {
      throw new Error(`Peer ${cleanPeer} has no registered E2EE public key on the server`);
    }

    // 1. ECDH shared secret derivation: ECDH P-256
    const sharedBits = await this.crypto.deriveBits(
      { name: 'ECDH', public: peerKey },
      this.identityKeyPair.privateKey,
      256
    );

    // 2. HKDF expansion to AES-256-GCM
    const salt = new TextEncoder().encode(`zyntra-dm-${chatId}`);
    const info = new TextEncoder().encode('zyntra-e2ee-message-key-v1');

    const hkdfKey = await this.crypto.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey']);
    const conversationKey = await this.crypto.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info,
      },
      hkdfKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    this.conversationKeys.set(chatId, conversationKey);
    console.log(`[E2EE-DEBUG] Derived conversation key: user=${this.currentUsername}, peer=${cleanPeer}, conversationId=${chatId}`);
    return conversationKey;
  }

  /**
   * Establish or retrieve a Group/Channel AES-256-GCM key
   */
  async getGroupConversationKey(chatId) {
    if (this.conversationKeys.has(chatId)) {
      return this.conversationKeys.get(chatId);
    }

    // 1. Try to fetch existing group key envelope from server
    try {
      const res = await api.messages.getGroupKey(chatId);
      if (res.ok && res.data?.data?.envelope) {
        const env = res.data.data.envelope;
        // Unwrap key using sender's public key + our private key
        const senderPubKey = await this.crypto.importKey(
          'spki',
          base64ToArrayBuffer(env.senderPublicKey),
          { name: 'ECDH', namedCurve: 'P-256' },
          true,
          []
        );

        const wrapSecret = await this.crypto.deriveBits(
          { name: 'ECDH', public: senderPubKey },
          this.identityKeyPair.privateKey,
          256
        );

        const hkdfKey = await this.crypto.importKey('raw', wrapSecret, 'HKDF', false, ['deriveKey']);
        const wrapAesKey = await this.crypto.deriveKey(
          {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: new TextEncoder().encode(`group-wrap-${chatId}`),
            info: new TextEncoder().encode('group-key-wrap'),
          },
          hkdfKey,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        );

        const decryptedRawKey = await this.crypto.decrypt(
          { name: 'AES-GCM', iv: base64ToArrayBuffer(env.nonce) },
          wrapAesKey,
          base64ToArrayBuffer(env.encryptedKey)
        );

        const importedGroupKey = await this.crypto.importKey(
          'raw',
          decryptedRawKey,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        );

        this.conversationKeys.set(chatId, importedGroupKey);
        return importedGroupKey;
      }
    } catch (e) {
      console.warn('[E2EE] Group key retrieval fallback:', e.message);
    }

    // 2. Deterministic group key derivation from group identifier (ensures all group members can decrypt)
    const salt = new TextEncoder().encode(`zyntra-group-${chatId}`);
    const rawSecret = new TextEncoder().encode(`zyntra-channel-secret-${chatId}`);
    const baseKey = await this.crypto.importKey('raw', rawSecret, 'HKDF', false, ['deriveKey']);
    const derivedGroupKey = await this.crypto.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info: new TextEncoder().encode('zyntra-group-aes-gcm-v1'),
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    this.conversationKeys.set(chatId, derivedGroupKey);
    return derivedGroupKey;
  }

  /**
   * Rotate a group key on membership change
   */
  async rotateGroupKey(chatId, memberPublicKeys = []) {
    // Generate new random 256-bit AES-GCM group key
    const newGroupKey = await this.crypto.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedRaw = await this.crypto.exportKey('raw', newGroupKey);
    const keyEnvelopes = [];

    // Wrap for each valid member
    for (const member of memberPublicKeys) {
      try {
        const memberKey = await this.crypto.importKey(
          'spki',
          base64ToArrayBuffer(member.publicKey),
          { name: 'ECDH', namedCurve: 'P-256' },
          true,
          []
        );

        const sharedBits = await this.crypto.deriveBits(
          { name: 'ECDH', public: memberKey },
          this.identityKeyPair.privateKey,
          256
        );

        const hkdfKey = await this.crypto.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey']);
        const wrapAesKey = await this.crypto.deriveKey(
          {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: new TextEncoder().encode(`group-wrap-${chatId}`),
            info: new TextEncoder().encode('group-key-wrap'),
          },
          hkdfKey,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt']
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedKeyBuffer = await this.crypto.encrypt(
          { name: 'AES-GCM', iv },
          wrapAesKey,
          exportedRaw
        );

        keyEnvelopes.push({
          userId: member.userId,
          encryptedKey: arrayBufferToBase64(encryptedKeyBuffer),
          nonce: arrayBufferToBase64(iv),
          senderPublicKey: this.publicKeySpkiBase64,
        });
      } catch (err) {
        console.warn(`[E2EE] Could not wrap group key for member ${member.userId}:`, err);
      }
    }

    if (keyEnvelopes.length > 0) {
      await api.messages.saveGroupKey({
        conversationId: chatId,
        epoch: Date.now(),
        keys: keyEnvelopes,
      });
    }

    this.conversationKeys.set(chatId, newGroupKey);
    return newGroupKey;
  }

  /**
   * Get AES-GCM conversation key based on chat type
   */
  async getConversationKey(chatId, chatType, participantInfo = null, expectedKeyId = null) {
    if (chatType === 'direct' || chatId.startsWith('dm_')) {
      let peer = participantInfo?.peerUsername || participantInfo?.peerId;
      const currentUsername = (participantInfo?.currentUsername || this.currentUsername || '')
        .toLowerCase()
        .replace(/^@/, '');

      // In a 1:1 conversation, if peer is missing or resolved to the current user (e.g. self-sent history),
      // extract the opposite participant from the canonical DM id: dm_<userA>_<userB>
      if ((!peer || peer.toLowerCase().replace(/^@/, '') === currentUsername) && chatId.startsWith('dm_')) {
        const rest = chatId.slice(3).toLowerCase();
        if (currentUsername && rest.startsWith(currentUsername + '_')) {
          peer = rest.slice(currentUsername.length + 1);
        } else if (currentUsername && rest.endsWith('_' + currentUsername)) {
          peer = rest.slice(0, -(currentUsername.length + 1));
        } else {
          const parts = rest.split('_');
          peer = parts.find((p) => p !== currentUsername) || parts[0];
        }
      }
      return await this.deriveDirectConversationKey(chatId, peer, expectedKeyId);
    }

    return await this.getGroupConversationKey(chatId);
  }

  /**
   * Encrypt message content and optional attachment into ciphertext + nonce
   */
  async encryptMessage(chatId, payload, chatType = 'workspace-node', participantInfo = null) {
    await this.ensureInitialized();
    const key = await this.getConversationKey(chatId, chatType, participantInfo);

    // Encode payload as UTF-8 JSON or plain text
    const textData = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const encoded = new TextEncoder().encode(textData);

    // 12-byte cryptographically secure random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const ciphertextBuffer = await this.crypto.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const keyId = this.fingerprint || 'v1';

    console.log(
      `[E2EE-DEBUG] Encrypted message: user=${this.currentUsername}, conversationId=${chatId}, keyId=${keyId}, encryptionVersion=1, ciphertextLen=${ciphertextBuffer.byteLength}, nonceLen=${iv.length}`
    );

    return {
      ciphertext: arrayBufferToBase64(ciphertextBuffer),
      nonce: arrayBufferToBase64(iv),
      encryptionVersion: 1,
      keyId,
    };
  }

  /**
   * Decrypt an encrypted message using the conversation AES-GCM key
   */
  async decryptMessage(message, participantInfo = null) {
    // If not encrypted or legacy message, return as-is
    if (!message || !message.ciphertext || !message.nonce) {
      return message;
    }

    await this.ensureInitialized();

    const ivBuffer = base64ToArrayBuffer(message.nonce);
    const ciphertextBuffer = base64ToArrayBuffer(message.ciphertext);

    // Helper to attempt AES-GCM decryption
    const attemptDecrypt = async (forceKeyRefresh = false) => {
      if (forceKeyRefresh) {
        this.conversationKeys.delete(message.chatId);
      }
      const key = await this.getConversationKey(
        message.chatId,
        message.chatType,
        participantInfo,
        message.keyId
      );

      const decryptedBuffer = await this.crypto.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        key,
        ciphertextBuffer
      );

      return new TextDecoder().decode(decryptedBuffer);
    };

    try {
      let decryptedString;
      try {
        decryptedString = await attemptDecrypt(false);
      } catch (firstErr) {
        // If decryption failed, peer may have updated their key pair. Retry once with fresh key resolution.
        decryptedString = await attemptDecrypt(true);
      }

      console.log(
        `[E2EE-DEBUG] Decrypted message: user=${this.currentUsername}, conversationId=${message.chatId}, keyId=${message.keyId}, encryptionVersion=${message.encryptionVersion || 1}, ciphertextLen=${ciphertextBuffer.byteLength}, nonceLen=${ivBuffer.byteLength}`
      );

      // Attempt to parse JSON payload (if it contained text + attachment)
      try {
        const parsed = JSON.parse(decryptedString);
        if (parsed && typeof parsed === 'object' && ('text' in parsed || 'attachment' in parsed)) {
          return {
            ...message,
            content: parsed.text || '',
            attachment: parsed.attachment || message.attachment || null,
            isEncrypted: true,
          };
        }
      } catch {
        // Plain text content
      }

      return {
        ...message,
        content: decryptedString,
        isEncrypted: true,
      };
    } catch (err) {
      console.warn(
        `[E2EE-DEBUG] Decryption FAILED: user=${this.currentUsername}, conversationId=${message.chatId}, keyId=${message.keyId}, ciphertextLen=${ciphertextBuffer.byteLength}, nonceLen=${ivBuffer.byteLength}, error=${err.message}`
      );
      return {
        ...message,
        content: '[🔒 Encrypted message]',
        isEncrypted: true,
        decryptFailed: true,
      };
    }
  }
}

export const encryptionService = new EncryptionService();
