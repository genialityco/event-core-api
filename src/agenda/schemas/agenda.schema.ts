import * as mongoose from 'mongoose';

export const AgendaSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    sessions: [
      {
        title: { type: String, required: true },
        titleEn: { type: String, required: false, default: '' },
        startDateTime: { type: Date, required: true },
        endDateTime: { type: Date, required: true },
        speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' }],
        moduleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Module',
          required: false,
        },
        room: { type: String, required: false },
        roomEn: { type: String, required: false, default: '' },
        typeSession: { type: String, required: false },
        typeSessionEn: { type: String, required: false, default: '' },
        requiresAttendance: { type: Boolean, default: false },
        subSessions: [
          {
            title: { type: String, required: true },
            titleEn: { type: String, required: false, default: '' },
            startDateTime: { type: Date, required: true },
            endDateTime: { type: Date, required: true },
            speakers: [
              { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
            ],
            moduleId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Module',
              required: false,
            },
            room: { type: String, required: false },
            roomEn: { type: String, required: false, default: '' },
          },
        ],
      },
    ],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    dressCode: { type: String, default: '' },
    dressCodeEn: { type: String, default: '' },
    room: { type: String, default: '' },
    roomEn: { type: String, default: '' },
  },
  { timestamps: true },
);
