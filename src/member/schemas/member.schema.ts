import { Schema } from 'mongoose';

export const MemberSchema = new Schema(
  {
    // userId se mantiene como String para compatibilidad con registros existentes
    userId: { type: String, required: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'attendee'],
      default: 'attendee',
    },
    memberActive: { type: Boolean, default: true },
    properties: { type: Object, default: {} },
  },
  { timestamps: true },
);

// Índices para performance en queries multi-tenant
MemberSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
MemberSchema.index({ organizationId: 1, memberActive: 1 });
MemberSchema.index({ userId: 1, memberActive: 1 }); // Para getActiveOrganizations
