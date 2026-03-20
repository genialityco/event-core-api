import * as mongoose from 'mongoose';
const { Schema } = mongoose;

export const TravelerInfoSchema = new Schema(
  {
    organizationId: { type: String, required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: String, required: true },

    // Identificación profesional
    tvChannel: { type: String, default: '' },
    position: { type: String, default: '' },

    // Vuelo de ida
    outboundOriginCity: { type: String, default: '' },
    outboundFlightNumber: { type: String, default: '' },
    outboundArrivalTime: { type: String, default: '' },

    // Vuelo de regreso
    returnOriginCity: { type: String, default: '' },
    returnFlightNumber: { type: String, default: '' },
    returnArrivalTime: { type: String, default: '' },

    // Requerimientos especiales
    dietaryRestrictions: { type: String, default: '' },
  },
  { timestamps: true },
);

// Un registro por usuario por evento dentro de una organización
TravelerInfoSchema.index({ organizationId: 1, eventId: 1, userId: 1 }, { unique: true });
