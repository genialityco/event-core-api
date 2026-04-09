import * as mongoose from 'mongoose';

export const UsefulInfoSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    title_en: { type: String, default: '' },
    category: { type: String, default: 'general' },
    icon: { type: String, default: '📌' },
    content: { type: String, default: '' },
    content_en: { type: String, default: '' },
    coverImageUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

UsefulInfoSchema.index({ eventId: 1, order: 1 });
UsefulInfoSchema.index({ organizationId: 1, eventId: 1 });
