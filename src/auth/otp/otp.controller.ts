import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { OtpService } from './otp.service';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

class SendOtpDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;
}

class VerifyOtpDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  code: string;
}

class RegisterOtpDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'La organización es requerida' })
  @IsString()
  organizationId: string;
}

class ValidateEmailDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;

  @IsNotEmpty({ message: 'La organización es requerida' })
  @IsString()
  organizationId: string;
}

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  /**
   * GET /auth/otp/org-config?organizationId=xxx
   * Devuelve config pública de la org (requirePreRegistration) sin token.
   */
  @Get('org-config')
  @HttpCode(HttpStatus.OK)
  async orgConfig(@Query('organizationId') organizationId: string) {
    return this.otpService.getOrgConfig(organizationId);
  }

  /**
   * POST /auth/otp/validate-email
   * Verifica si un correo está autorizado para registrarse (whitelist check).
   * Ruta pública — no requiere token ni tenant.
   */
  @Post('validate-email')
  @HttpCode(HttpStatus.OK)
  async validateEmail(@Body() dto: ValidateEmailDto) {
    return this.otpService.validateEmail(dto.email, dto.organizationId);
  }

  /** POST /auth/otp/register — Registra usuario sin contraseña */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterOtpDto) {
    await this.otpService.register(dto.email, dto.name, dto.organizationId);
    return { message: 'Registro exitoso. Ahora ingresa con tu correo.' };
  }

  /** POST /auth/otp/login — Login directo por correo (sin código) */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: SendOtpDto) {
    const { token } = await this.otpService.loginDirect(dto.email);
    return { token };
  }

  /** POST /auth/otp/send — Envía código OTP al correo */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendOtpDto) {
    await this.otpService.sendCode(dto.email);
    return { message: 'Código enviado a tu correo.' };
  }

  /** POST /auth/otp/verify — Verifica código y retorna Firebase custom token */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyOtpDto) {
    const { token } = await this.otpService.verifyCode(dto.email, dto.code);
    return { token };
  }
}
