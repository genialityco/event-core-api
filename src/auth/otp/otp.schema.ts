import { Schema } from 'mongoose';

/**
 * Almacena temporalmente los códigos OTP enviados por email.
 * El índice TTL elimina automáticamente los documentos expirados.
 */
export const OtpSchema = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  /** TTL: MongoDB elimina el documento automáticamente cuando expira */
  expiresAt: { type: Date, required: true },
});

// Índice TTL — MongoDB borra el doc cuando Date.now() > expiresAt
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Índice para buscar por email rápidamente
OtpSchema.index({ email: 1 });

export interface OtpDocument {
  email: string;
  code: string;
  expiresAt: Date;
}
