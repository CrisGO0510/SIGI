import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserRepository } from '../../users/repositories/user.repository';
import { EmpresaRepository } from '../../empresas/repositories/empresa.repository';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { EmailService } from '../../../infraestructure/email/email.service';
import { Usuario } from '../../../database/entities';
import { LoginDto, RegisterDto } from '../dtos';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private empresaRepository: EmpresaRepository,
    private jwtService: JwtService,
    private passwordResetRepository: PasswordResetRepository,
    private emailService: EmailService,
  ) {}

  /**
   * Login de usuario
   * Verifica credenciales y genera JWT token
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_encrypted,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Actualizar last_login
    await this.userRepository.updateLastLogin(user.id);

    // 4. Generar JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  /**
   * Registro de nuevo usuario
   * Encripta password y crea usuario en BD
   */
  async register(registerDto: RegisterDto) {
    const { email, password, nombre, rol, empresa_id } = registerDto;

    // 1. Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Validar que la empresa existe
    const empresa = await this.empresaRepository.findById(empresa_id);

    if (!empresa) {
      throw new NotFoundException(
        `La empresa con ID ${empresa_id} no existe. Por favor, verifica el ID de la empresa.`,
      );
    }

    // 3. Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear usuario
    const newUser: Partial<Usuario> = {
      nombre,
      email,
      password_encrypted: hashedPassword,
      rol,
      empresa_id,
    };

    const user = await this.userRepository.create(newUser);

    // 4. Generar JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  /**
   * Validar token JWT
   */
  async validateToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Refrescar token (genera uno nuevo)
   */
  async refreshToken(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  /**
   * Solicitar recuperación de contraseña: genera un código de 6 dígitos y lo envía por email.
   * Por seguridad, la respuesta siempre será 200 aunque el email no exista.
   */
  async requestPasswordReset(email: string) {
    // Intentar obtener el usuario; no revelar existencia
    const user = await this.userRepository.findByEmail(email);

    // Invalidate previous resets for this email
    await this.passwordResetRepository.invalidateOldResets(email);

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const payload: Partial<any> = {
      usuario_id: user ? user.id : null,
      email,
      codigo_verificacion: codigo,
      token_hash: null,
      usado: false,
      expira_en: expira.toISOString(),
    };

    const reset = await this.passwordResetRepository.createReset(payload);

    // Enviar email con el código (si el servicio de email está disponible)
    try {
      await this.emailService.sendEmail({
        to: email,
        subject: 'Código de recuperación de contraseña - SIGI',
        text: `Tu código de recuperación es: ${codigo}. Tiene una validez de 15 minutos. Si no solicitaste este código, ignora este correo.`,
        html: `<p>Hola,</p><p>Tu código de recuperación de contraseña es: <strong>${codigo}</strong></p><p>Este código caduca en 15 minutos.</p>`,
      });
    } catch (err) {
      // no bloquear el flujo por fallos en envío de correo
    }

    return { ok: true };
  }

  /**
   * Valida el código enviado por email. Si es correcto, genera un token especial (hash) y lo devuelve.
   */
  async validateVerificationCode(email: string, codigo: string) {
    const reset = await this.passwordResetRepository.findActiveByEmail(email);

    if (!reset) {
      throw new NotFoundException('Código inválido o expirado');
    }

    if (reset.codigo_verificacion !== codigo) {
      throw new NotFoundException('Código inválido o expirado');
    }

    // Generar token hash seguro
    const tokenHash = randomBytes(32).toString('hex');

    await this.passwordResetRepository.setTokenHash(reset.id, tokenHash);

    return { token: tokenHash };
  }

  /**
   * Cambiar contraseña usando el token generado tras validar el código
   */
  async resetPasswordWithToken(token: string, newPassword: string) {
    const reset = await this.passwordResetRepository.findByTokenActive(token);

    if (!reset) {
      throw new NotFoundException('Token inválido o expirado');
    }

    if (!reset.usuario_id) {
      // Si no hay usuario asociado (por privacidad), no permitimos restablecer
      throw new NotFoundException('Usuario no encontrado para este token');
    }

    // Encriptar nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario
    await this.userRepository.update(reset.usuario_id, { password_encrypted: hashed } as Partial<Usuario>);

    // Marcar reset como usado
    await this.passwordResetRepository.markUsed(reset.id);

    return { ok: true };
  }
}
