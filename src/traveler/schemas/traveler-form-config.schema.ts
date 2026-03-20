import * as mongoose from 'mongoose';

const FieldConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
  },
  { _id: false },
);

const SectionConfigSchema = new mongoose.Schema(
  {
    // Claves fijas que el frontend reconoce para mapear al schema de traveler
    key: {
      type: String,
      required: true,
      enum: ['outbound_flight', 'return_flight', 'dietary', 'professional'],
    },
    label: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    fields: { type: [FieldConfigSchema], default: [] },
  },
  { _id: false },
);

export const TravelerFormConfigSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true, // una config por evento
    },
    sections: { type: [SectionConfigSchema], default: defaultSections() },
    // Enlace al grupo de WhatsApp — vacío = sección oculta en la app
    whatsappGroupUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

function defaultSections() {
  return [
    {
      key: 'outbound_flight',
      label: 'Vuelo de llegada',
      enabled: true,
      fields: [
        { key: 'outboundOriginCity', label: 'Ciudad de origen', required: false, enabled: true },
        { key: 'outboundFlightNumber', label: 'Número de vuelo', required: false, enabled: true },
        { key: 'outboundArrivalTime', label: 'Hora de llegada', required: false, enabled: true },
      ],
    },
    {
      key: 'return_flight',
      label: 'Vuelo de regreso',
      enabled: true,
      fields: [
        { key: 'returnOriginCity', label: 'Ciudad de origen', required: false, enabled: true },
        { key: 'returnFlightNumber', label: 'Número de vuelo', required: false, enabled: true },
        { key: 'returnArrivalTime', label: 'Hora de regreso', required: false, enabled: true },
      ],
    },
    {
      key: 'dietary',
      label: 'Alimentación',
      enabled: true,
      fields: [
        { key: 'dietaryRestrictions', label: 'Restricciones alimentarias', required: false, enabled: true },
      ],
    },
    {
      key: 'professional',
      label: 'Información profesional',
      enabled: true,
      fields: [
        { key: 'tvChannel', label: 'Canal / Medio', required: false, enabled: true },
        { key: 'position', label: 'Cargo', required: false, enabled: true },
      ],
    },
  ];
}
