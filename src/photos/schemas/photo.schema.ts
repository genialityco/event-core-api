import * as mongoose from 'mongoose';

export const PhotoSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: String, required: true },
    userName: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    storageRef: { type: String, required: true },
  },
  { timestamps: true },
);

PhotoSchema.index({ eventId: 1, createdAt: -1 });
PhotoSchema.index({ organizationId: 1, eventId: 1 });
PhotoSchema.index({ eventId: 1, userId: 1 });
