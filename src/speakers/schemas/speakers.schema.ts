import { Schema } from 'mongoose';

export const SpeakerSchema = new Schema(
  {
    names: { type: String, required: true },
    description: { type: String, required: true },
    descriptionEN: { type: String, required: true },
    location: { type: String, required: false },
    country: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    role: { type: String, default: '' },
    roleEN: { type: String, default: '' },
    organization: { type: String, default: '' },
  },
  { timestamps: true },
);
