import * as mongoose from 'mongoose';

export const PreRegisteredAttendeeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    name: { type: String, trim: true, default: null },
    channel: { type: String, trim: true, default: null },
    position: { type: String, trim: true, default: null },
    observations: { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: null },
    isActivated: { type: Boolean, default: false },
    activatedAt: { type: Date, default: null },
    activatedByUserId: { type: String, default: null },
  },
  { timestamps: true },
);

PreRegisteredAttendeeSchema.index(
  { email: 1, organizationId: 1 },
  { unique: true },
);
PreRegisteredAttendeeSchema.index({ organizationId: 1 });
PreRegisteredAttendeeSchema.index({ eventId: 1 });

export type PreRegisteredAttendeeDocument = mongoose.Document & {
  email: string;
  organizationId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId | null;
  name: string | null;
  channel: string | null;
  position: string | null;
  observations: string | null;
  country: string | null;
  isActivated: boolean;
  activatedAt: Date | null;
  activatedByUserId: string | null;
};
