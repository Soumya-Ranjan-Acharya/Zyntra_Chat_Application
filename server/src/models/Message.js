import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true },
    count: { type: Number, default: 1 },
    users: { type: [String], default: [] },
  },
  { _id: false }
);

const AttachmentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'file'], required: true },
    name: { type: String, required: true },
    size: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    chatType: {
      type: String,
      enum: ['direct', 'personal-group', 'workspace-node'],
      default: 'workspace-node',
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderUsername: {
      type: String,
      default: '',
    },
    senderAvatar: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
    ciphertext: {
      type: String,
      default: null,
    },
    nonce: {
      type: String,
      default: null,
    },
    encryptionVersion: {
      type: Number,
      default: 1,
    },
    keyId: {
      type: String,
      default: null,
    },
    clientTempId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    attachment: {
      type: AttachmentSchema,
      default: null,
    },
    reactions: {
      type: [ReactionSchema],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Message', MessageSchema);
