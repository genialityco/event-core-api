import { Types } from 'mongoose';

export interface Agenda {
  eventId: Types.ObjectId;
  dressCode?: string;
  dressCodeEn?: string;
  room?: string;
  roomEn?: string;
  isPublished?: boolean;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  sessions: {
    title: string;
    titleEn?: string;
    startDateTime: Date;
    endDateTime: Date;
    speakers: Types.ObjectId[];
    module?: Types.ObjectId;
    room?: string;
    roomEn?: string;
    typeSession?: string;
    typeSessionEn?: string;
    subSessions?: {
      title: string;
      titleEn?: string;
      startDateTime: Date;
      endDateTime: Date;
      speakers?: Types.ObjectId[];
      module?: Types.ObjectId;
      room?: string;
      roomEn?: string;
    }[];
  }[];
}
