import * as mongoose from 'mongoose';

export const SessionAttendanceSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    agendaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agenda',
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    userId: { type: String, required: true },
    // 'registered' = marcó "asistiré", 'attended' = check-in real
    status: {
      type: String,
      enum: ['registered', 'attended'],
      default: 'registered',
    },
  },
  { timestamps: true },
);

// Un registro por sesión por miembro
SessionAttendanceSchema.index({ sessionId: 1, memberId: 1 }, { unique: true });
// Para queries rápidas por evento + usuario
SessionAttendanceSchema.index({ eventId: 1, userId: 1 });
