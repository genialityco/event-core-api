import { Schema } from 'mongoose';
import { Attendee } from 'src/attendee/interfaces/attendee.interface';
import { Member } from 'src/member/interfaces/member.interface';

export const UserSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, index: true },
    // email agregado para soportar OTP y búsquedas sin ir a Firebase
    email: { type: String, required: false },
    expoPushToken: { type: String, required: false },
  },
  { timestamps: true },
);

// Índice único en firebaseUid — crítico para el TenantMiddleware (query en cada request)
UserSchema.index({ firebaseUid: 1 }, { unique: true });
export interface UserFirebase {
  email: string;
  password: string;
}
export interface addOrCreateAttendee {
  user: UserFirebase;
  attendee: Attendee;
  member: Member
}
