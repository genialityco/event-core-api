import { Document, Types } from 'mongoose';

export interface Member extends Document {
  userId: string; // almacenado como String en schema (compatibilidad con datos existentes)
  organizationId: Types.ObjectId;
  role: 'admin' | 'staff' | 'attendee';
  memberActive: boolean;
  properties: Record<string, any>;
}
