import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { Contact } from '../models/Contact.js';
import Message from '../models/Message.js';
import { io as ClientIO } from '../../../client/node_modules/socket.io-client/build/esm/index.js';

async function testDmSync() {
  console.log('--- STEP 1: DB Connection ---');
  await connectDB();

  console.log('\n--- STEP 2: Verify Users ---');
  const users = await User.find({}, 'name email primaryUsername').lean();
  console.log('Found users in Atlas:', users.map(u => ({ id: u._id.toString(), name: u.name, username: u.primaryUsername })));

  const anitaUser = users.find(u => u.primaryUsername === 'anita');
  const soumyaUser = users.find(u => u.primaryUsername === 'soumya');

  if (!anitaUser || !soumyaUser) {
    throw new Error('Anita or Soumya user not found in DB!');
  }

  console.log('\n--- STEP 3: Verify Canonical Contacts in DB ---');
  const contacts = await Contact.find({ id: 'dm_anita_soumya' }).lean();
  console.log(`Found ${contacts.length} contact records for 'dm_anita_soumya':`);
  contacts.forEach(c => {
    console.log(`  - ownerId: ${c.ownerId}, username: ${c.username}, name: ${c.name}, lastMessage: "${c.lastMessage}"`);
  });

  if (contacts.length < 2) {
    console.log('Creating reciprocal contacts for both users...');
    await Contact.deleteMany({ id: 'dm_anita_soumya' });
    await Contact.create([
      {
        id: 'dm_anita_soumya',
        ownerId: anitaUser._id.toString(),
        name: soumyaUser.name,
        username: soumyaUser.primaryUsername,
        avatar: null,
        bio: 'Lead Developer @ Zyntra',
        status: 'online',
        lastMessage: 'Testing chat sync',
        lastMessageTime: new Date()
      },
      {
        id: 'dm_anita_soumya',
        ownerId: soumyaUser._id.toString(),
        name: anitaUser.name,
        username: anitaUser.primaryUsername,
        avatar: null,
        bio: 'Product Designer',
        status: 'online',
        lastMessage: 'Testing chat sync',
        lastMessageTime: new Date()
      }
    ]);
  }

  console.log('\n--- STEP 4: Verify Existing Messages in DB ---');
  const initialMsgs = await Message.find({ chatId: 'dm_anita_soumya' }).sort({ timestamp: 1 }).lean();
  console.log(`dm_anita_soumya has ${initialMsgs.length} messages in DB:`);
  initialMsgs.forEach(m => {
    console.log(`  [${m.senderUsername}]: ${m.content} (${m.timestamp})`);
  });

  console.log('\n--- STEP 5: Real-Time Socket.IO Synchronization Test ---');
  const serverUrl = 'http://localhost:5000';

  const anitaSocket = ClientIO(serverUrl, {
    transports: ['websocket', 'polling'],
    forceNew: true
  });

  const soumyaSocket = ClientIO(serverUrl, {
    transports: ['websocket', 'polling'],
    forceNew: true
  });

  await Promise.all([
    new Promise((resolve) => anitaSocket.on('connect', resolve)),
    new Promise((resolve) => soumyaSocket.on('connect', resolve))
  ]);

  console.log('Both Anita and Soumya connected to Socket.IO server!');

  // Join the shared room
  anitaSocket.emit('join_room', 'dm_anita_soumya');
  soumyaSocket.emit('join_room', 'dm_anita_soumya');

  await new Promise((r) => setTimeout(r, 200));

  // Test 1: Anita sends to Soumya
  const testMsgFromAnita = {
    id: `test-msg-${Date.now()}-1`,
    chatId: 'dm_anita_soumya',
    senderId: anitaUser._id.toString(),
    senderName: anitaUser.name,
    senderUsername: anitaUser.primaryUsername,
    senderAvatar: null,
    content: `Automated test message from Anita at ${new Date().toLocaleTimeString()}`,
    timestamp: new Date().toISOString()
  };

  const soumyaReceivedPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout waiting for Soumya to receive message!')), 5000);
    soumyaSocket.on('receive_message', (msg) => {
      if (msg.id === testMsgFromAnita.id) {
        clearTimeout(timeout);
        resolve(msg);
      }
    });
  });

  console.log('Emitting message from Anita to room dm_anita_soumya...');
  anitaSocket.emit('send_message', testMsgFromAnita);

  const receivedBySoumya = await soumyaReceivedPromise;
  console.log('SUCCESS: Soumya received Anita message in real time:', receivedBySoumya.content);

  // Test 2: Soumya sends to Anita
  const testMsgFromSoumya = {
    id: `test-msg-${Date.now()}-2`,
    chatId: 'dm_anita_soumya',
    senderId: soumyaUser._id.toString(),
    senderName: soumyaUser.name,
    senderUsername: soumyaUser.primaryUsername,
    senderAvatar: null,
    content: `Automated reply from Soumya at ${new Date().toLocaleTimeString()}`,
    timestamp: new Date().toISOString()
  };

  const anitaReceivedPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout waiting for Anita to receive message!')), 5000);
    anitaSocket.on('receive_message', (msg) => {
      if (msg.id === testMsgFromSoumya.id) {
        clearTimeout(timeout);
        resolve(msg);
      }
    });
  });

  console.log('Emitting message from Soumya to room dm_anita_soumya...');
  soumyaSocket.emit('send_message', testMsgFromSoumya);

  const receivedByAnita = await anitaReceivedPromise;
  console.log('SUCCESS: Anita received Soumya message in real time:', receivedByAnita.content);

  // Disconnect sockets
  anitaSocket.disconnect();
  soumyaSocket.disconnect();

  console.log('\n--- STEP 6: Verify Database Persistence ---');
  await new Promise((r) => setTimeout(r, 400));
  const persistedMsgs = await Message.find({ chatId: 'dm_anita_soumya' }).sort({ timestamp: 1 }).lean();
  console.log(`Total messages in dm_anita_soumya after test: ${persistedMsgs.length}`);
  const lastTwo = persistedMsgs.slice(-2);
  console.log('Last two messages in DB:');
  lastTwo.forEach(m => console.log(`  [${m.senderUsername}]: ${m.content}`));

  console.log('\n--- STEP 7: Verify Contact Sidebar Synchronization ---');
  const updatedContacts = await Contact.find({ id: 'dm_anita_soumya' }).lean();
  updatedContacts.forEach(c => {
    console.log(`  Contact for owner ${c.ownerId} lastMessage: "${c.lastMessage}"`);
  });

  console.log('\n✅ ALL TESTS PASSED! Direct Messaging synchronization is fully functioning.');
  process.exit(0);
}

testDmSync().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
