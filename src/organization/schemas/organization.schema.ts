import * as mongoose from 'mongoose';

export const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Identificador único legible — ej: "acho", "acme"
    // Nullable al inicio para no romper registros existentes
    slug: { type: String, sparse: true },

    // Métodos de autenticación habilitados para esta organización
    auth: {
      emailPassword: { type: Boolean, default: true },
      emailOtp: { type: Boolean, default: false },
    },

    // Feature flags — source of truth en backend
    // Keys estandarizados según datos reales en BD
    features: {
      agenda:      { type: Boolean, default: true },
      speakers:    { type: Boolean, default: true },
      survey:      { type: Boolean, default: true },
      certificate: { type: Boolean, default: true },
      documents:   { type: Boolean, default: true },
      news:        { type: Boolean, default: true },
      highlights:  { type: Boolean, default: true },
      posters:     { type: Boolean, default: true },
      rooms:       { type: Boolean, default: true },
      // Módulos opcionales — deshabilitados por defecto hasta que se contraten
      traveler:    { type: Boolean, default: false },
      hotels:      { type: Boolean, default: false },
      attendance:  { type: Boolean, default: false },
      usefulInfo:  { type: Boolean, default: false },
      photos:      { type: Boolean, default: false },
    },

    // Config white-label consumida por el frontend (fallback local en la app)
    branding: {
      primaryColor: { type: String, default: '#000000' },
      secondaryColor: { type: String, default: '#ffffff' },
      tabBarColor: { type: String, default: '#ffffff' },
      logoUrl: { type: String },
      appName: { type: String },
      fontFamily: { type: String },
    },

    // Mapeo bundleId → tenant para resolución automática (SOLO UX, no seguridad)
    bundleIds: {
      ios: { type: String },     // ej: "com.acho.eventosactualidad"
      android: { type: String }, // ej: "com.geniality.achoapp"
    },

    // Evento activo en la app — el que ven los usuarios al abrir la aplicación
    activeEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },

    propertiesDefinition: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

// Índices
OrganizationSchema.index({ slug: 1 }, { unique: true, sparse: true });
OrganizationSchema.index({ 'bundleIds.ios': 1 });
OrganizationSchema.index({ 'bundleIds.android': 1 });
