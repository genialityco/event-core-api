import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { OtpDocument } from './otp.schema';

const OTP_EXPIRY_MINUTES = 5;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @InjectModel('Otp') private readonly otpModel: Model<OtpDocument>,
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('Member') private readonly memberModel: Model<any>,
    @InjectModel('Organization') private readonly orgModel: Model<any>,
    @InjectModel('PreRegisteredAttendee')
    private readonly preRegModel: Model<any>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // ─── Config pública de la org (sin autenticación) ────────────────────────

  /** Devuelve solo los campos públicos necesarios antes de que el usuario inicie sesión. */
  async getOrgConfig(
    organizationId: string,
  ): Promise<{ requirePreRegistration: boolean }> {
    const org = (await this.orgModel
      .findById(organizationId)
      .select('auth')
      .lean()) as any;
    return {
      requirePreRegistration: org?.auth?.requirePreRegistration ?? false,
    };
  }

  // ─── Validación de correo (antes del registro) ────────────────────────────

  /**
   * Verifica si un correo puede registrarse en la organización.
   * Si la org tiene requirePreRegistration=true, el correo debe estar en la lista.
   * También indica si el usuario ya tiene cuenta (para dirigirlo a login).
   */
  async validateEmail(
    email: string,
    organizationId: string,
  ): Promise<{ allowed: boolean; isExistingUser: boolean; message?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const org = await this.orgModel
      .findById(organizationId)
      .select('auth')
      .lean() as any;

    if (!org) {
      return { allowed: false, isExistingUser: false, message: 'Organización no encontrada.' };
    }

    const isExistingUser = !!(await this.userModel
      .findOne({ email: normalizedEmail })
      .lean());

    if (!org.auth?.requirePreRegistration) {
      return { allowed: true, isExistingUser };
    }

    const preReg = await this.preRegModel
      .findOne({ email: normalizedEmail, organizationId })
      .lean();

    if (!preReg) {
      return {
        allowed: false,
        isExistingUser: false,
        message: 'Este correo no está autorizado para este evento.',
      };
    }

    return { allowed: true, isExistingUser };
  }

  // ─── Registro ─────────────────────────────────────────────────────────────

  /**
   * Registra un usuario nuevo vía OTP.
   * 1. Verifica whitelist si la org lo requiere
   * 2. Crea cuenta en Firebase (sin contraseña, custom token para login)
   * 3. Crea User en MongoDB
   * 4. Crea Member con rol attendee
   * 5. Marca el pre-registro como activado
   */
  async register(email: string, name: string, organizationId: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar whitelist
    const validation = await this.validateEmail(normalizedEmail, organizationId);
    if (!validation.allowed) {
      throw new ForbiddenException(
        validation.message ?? 'Este correo no está autorizado para este evento.',
      );
    }

    // Verificar si ya existe en Firebase
    let firebaseUid: string;
    try {
      const existing = await admin.auth().getUserByEmail(normalizedEmail);
      firebaseUid = existing.uid;
      this.logger.log(`Usuario Firebase ya existe: ${firebaseUid}`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // Crear usuario Firebase sin contraseña
        const created = await admin.auth().createUser({
          email: normalizedEmail,
          displayName: name,
          emailVerified: false,
        });
        firebaseUid = created.uid;
        this.logger.log(`Usuario Firebase creado: ${firebaseUid}`);
      } else {
        throw err;
      }
    }

    // Crear User en MongoDB si no existe
    let mongoUser = (await this.userModel.findOne({ firebaseUid }).lean()) as any;
    if (!mongoUser) {
      mongoUser = await this.userModel.create({
        firebaseUid,
        email: normalizedEmail,
      });
    }

    // Verificar si ya es miembro de la organización
    const existingMember = await this.memberModel.findOne({
      userId: (mongoUser._id as any).toString(),
      organizationId,
    });

    if (existingMember) {
      throw new ConflictException(
        'Este correo ya está registrado en la organización.',
      );
    }

    // Crear Member
    await this.memberModel.create({
      userId: (mongoUser._id as any).toString(),
      organizationId,
      memberActive: true,
      properties: { name, email: normalizedEmail },
    });

    // Marcar pre-registro como activado
    await this.preRegModel.findOneAndUpdate(
      { email: normalizedEmail, organizationId },
      {
        $set: {
          isActivated: true,
          activatedAt: new Date(),
          activatedByUserId: (mongoUser._id as any).toString(),
        },
      },
    );

    this.logger.log(`Registro OTP completado: ${normalizedEmail}`);
  }

  // ─── Login directo por correo (sin OTP) ──────────────────────────────────

  /**
   * Busca el usuario por email y retorna un Firebase custom token directamente.
   * No requiere verificación por código — solo que el usuario esté registrado.
   */
  async loginDirect(email: string): Promise<{ token: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = (await this.userModel
      .findOne({ email: normalizedEmail }, { firebaseUid: 1 })
      .lean()) as any;

    if (!user) {
      throw new NotFoundException(
        'No encontramos una cuenta con ese correo. Por favor regístrate primero.',
      );
    }

    const token = await admin.auth().createCustomToken(user.firebaseUid);
    this.logger.log(`Login directo: ${normalizedEmail}`);
    return { token };
  }

  // ─── Envío de código ──────────────────────────────────────────────────────

  /**
   * Genera y envía un código OTP de 6 dígitos al correo.
   * Requiere que el usuario esté registrado.
   */
  async sendCode(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar que el usuario existe en el sistema
    const user = await this.userModel.findOne({ email: normalizedEmail }).lean();
    if (!user) {
      throw new NotFoundException(
        'No encontramos una cuenta con ese correo. Por favor regístrate primero.',
      );
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Reemplazar código previo (si existía)
    await this.otpModel.deleteMany({ email: normalizedEmail });
    await this.otpModel.create({ email: normalizedEmail, code, expiresAt });

    // Enviar email
    await this.sendEmail(normalizedEmail, code);

    this.logger.log(`OTP enviado a: ${normalizedEmail}`);
  }

  // ─── Verificación ─────────────────────────────────────────────────────────

  /**
   * Verifica el código OTP y retorna un Firebase custom token.
   * El frontend usa ese token con signInWithCustomToken().
   */
  async verifyCode(email: string, code: string): Promise<{ token: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await this.otpModel
      .findOne({ email: normalizedEmail })
      .lean();

    if (!otpRecord) {
      throw new BadRequestException(
        'El código ha expirado o no existe. Solicita uno nuevo.',
      );
    }

    if (otpRecord.code !== code) {
      throw new BadRequestException('Código incorrecto.');
    }

    if (new Date() > otpRecord.expiresAt) {
      await this.otpModel.deleteMany({ email: normalizedEmail });
      throw new BadRequestException('El código ha expirado. Solicita uno nuevo.');
    }

    // Eliminar el código usado (one-time use)
    await this.otpModel.deleteMany({ email: normalizedEmail });

    // Obtener firebaseUid desde MongoDB
    const user = (await this.userModel
      .findOne({ email: normalizedEmail }, { firebaseUid: 1 })
      .lean()) as any;

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // Crear Firebase custom token
    const token = await admin.auth().createCustomToken(user.firebaseUid);

    this.logger.log(`OTP verificado y custom token emitido para: ${normalizedEmail}`);

    return { token };
  }

  // ─── Privado: envío de email ──────────────────────────────────────────────

  private async sendEmail(to: string, code: string): Promise<void> {
    const appName = process.env.APP_NAME ?? 'AILS News';
    const from = process.env.SMTP_FROM ?? `"${appName}" <noreply@ailsnews.com>`;

    await this.transporter.sendMail({
      from,
      to,
      subject: `Tu código de acceso - ${appName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>${appName}</h2>
          <p>Tu código de acceso es:</p>
          <div style="
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            padding: 20px;
            background: #f4f4f4;
            border-radius: 8px;
            margin: 20px 0;
          ">${code}</div>
          <p>Este código vence en <strong>${OTP_EXPIRY_MINUTES} minutos</strong>.</p>
          <p style="color: #999; font-size: 13px;">
            Si no solicitaste este código, ignora este mensaje.
          </p>
        </div>
      `,
    });
  }
}
