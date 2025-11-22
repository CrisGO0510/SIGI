import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../users/repositories/user.repository';
import { EmpresaRepository } from '../../empresas/repositories/empresa.repository';
import { Usuario } from '../../../database/entities';
import { LoginDto, RegisterDto } from '../dtos';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private empresaRepository: EmpresaRepository,
    private jwtService: JwtService,
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
}
