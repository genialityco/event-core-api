import { Document, Types } from 'mongoose';

export interface Speaker extends Document {
  readonly names: string;
  readonly description: string;
  readonly descriptionEN: string;
  readonly role?: string;
  readonly roleEN?: string;
  readonly organization?: string;
  readonly location?: string;
  readonly country: string;
  readonly imageUrl: string;
  eventId: Types.ObjectId;
}
