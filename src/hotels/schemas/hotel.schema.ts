import * as mongoose from 'mongoose';

export const HotelSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    price: { type: String, default: '' },
    bookingUrl: { type: String, default: '' },
    hotelUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isMain: { type: Boolean, default: false },
    distanceMinutes: { type: Number, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

HotelSchema.index({ eventId: 1, order: 1 });
HotelSchema.index({ organizationId: 1, eventId: 1 });
