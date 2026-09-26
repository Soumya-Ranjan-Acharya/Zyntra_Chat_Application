import mongoose from 'mongoose';

const MemberKeyEnvelopeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    encryptedKey: { type: String, required: true },
    nonce: { type: String, required: true },
    senderPublicKey: { type: String, required: true },
  },
  { _id: false }
);

const GroupKeySchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    epoch: {
      type: Number,
      required: true,
      default: 1,
    },
    creatorId: {
      type: String,
      required: true,
    },
    keys: {
      type: [MemberKeyEnvelopeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying specific epoch of conversation
GroupKeySchema.index({ conversationId: 1, epoch: -1 });

export default mongoose.model('GroupKey', GroupKeySchema);
