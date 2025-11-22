import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dtos';
import { SolicitarRecuperacionDto } from '../dtos/solicitar-recuperacion.dto';
import { ValidarCodigoDto } from '../dtos/validar-codigo.dto';
import { CambiarPasswordDto } from '../dtos/cambiar-password.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Login de usuario - endpoint público
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login de usuario',
    description: `
**Endpoint público - No requiere autenticación**

**Ejemplo de request:**
\`\`\`bash
curl -X POST http://localhost:3005/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@test.com",
    "password": "password123"
  }'
\`\`\`

**Respuesta:**
Retorna un \`access_token\` que debes usar en los demás endpoints protegidos.
    `,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso - Guarda el access_token para usarlo en otros endpoints',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDhiNjc4Ni1mZjVmLTQ0OWYtOTIzMy1iMzM2MzZjYTgwNjEiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2wiOiJFTVBMRUFETyIsIm5vbWJyZSI6IlVzdWFyaW8gUHJ1ZWJhIiwiaWF0IjoxNzYzNzY3NDgzLCJleHAiOjE3NjQzNzIyODN9.NdbjzEoI45BGrBbm_HKhPbIU3snKNV2sT5dcaE97GEU',
        user: {
          id: '508b6786-ff5f-449f-9233-b33636ca8061',
          nombre: 'Usuario Prueba',
          email: 'test@test.com',
          rol: 'EMPLEADO',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/register
   * Registro de nuevo usuario - endpoint público
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: `
**Endpoint público - No requiere autenticación**

Crea un nuevo usuario en el sistema. Debes especificar uno de los siguientes roles:

**Roles disponibles:**
- \`EMPLEADO\` - Usuario regular que puede reportar incapacidades
- \`RRHH\` - Personal de Recursos Humanos con permisos de gestión
- \`ADMIN\` - Administrador con acceso completo al sistema

**⚠️ Campo obligatorio:**
- \`empresa_id\` - Debes proporcionar un UUID válido de una empresa existente

**Ejemplo de request:**
\`\`\`bash
# 1. Primero obtén el ID de una empresa (requiere token de ADMIN o RRHH)
curl -X GET http://localhost:3005/empresas \\
  -H "Authorization: Bearer tu-token-admin"

# 2. Luego registra el usuario con el empresa_id
curl -X POST http://localhost:3005/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol": "EMPLEADO",
    "empresa_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
\`\`\`

**Respuesta:**
Retorna un \`access_token\` que puedes usar inmediatamente en los demás endpoints protegidos.
    `,
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          rol: 'EMPLEADO',
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 404, description: 'La empresa especificada no existe' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * GET /auth/me
   * Obtener perfil del usuario autenticado
   */
  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario autenticado',
    description: `
**Requiere autenticación:**
- Click en el botón "Authorize" 🔒 arriba
- Pega tu token JWT (sin "Bearer", solo el token)
- O incluye el header: \`Authorization: Bearer tu-token-aqui\`

**Ejemplo de request:**
\`\`\`bash
curl -X GET http://localhost:3005/auth/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        message: 'Usuario autenticado',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'juan@example.com',
          rol: 'EMPLEADO',
          nombre: 'Juan Pérez',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado - Token no proporcionado o inválido' })
  getProfile(@CurrentUser() user) {
    return {
      message: 'Usuario autenticado',
      user,
    };
  }

  /**
   * POST /auth/refresh
   * Refrescar token JWT
   */
  @UseGuards(AuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refrescar token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          rol: 'EMPLEADO',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async refreshToken(@CurrentUser('id') userId: string) {
    return this.authService.refreshToken(userId);
  }

  /**
   * POST /auth/recuperar-password/solicitar
   * Solicitar código de recuperación por email (público)
   */
  @Public()
  @Post('recuperar-password/solicitar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar código de recuperación por email' })
  async solicitarRecuperacion(@Body() body: SolicitarRecuperacionDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  /**
   * POST /auth/recuperar-password/validar
   * Validar el código recibido por email. Devuelve un token temporal (hash).
   */
  @Public()
  @Post('recuperar-password/validar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar código de recuperación' })
  async validarCodigo(@Body() body: ValidarCodigoDto) {
    return this.authService.validateVerificationCode(body.email, body.codigo);
  }

  /**
   * POST /auth/recuperar-password/cambiar
   * Cambiar la contraseña usando el token recibido tras validar el código
   */
  @Public()
  @Post('recuperar-password/cambiar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña con token' })
  async cambiarPassword(@Body() body: CambiarPasswordDto) {
    return this.authService.resetPasswordWithToken(body.token, body.newPassword);
  }

  /**
   * POST /auth/validate
   * Validar token JWT (útil para el frontend)
   */
  @UseGuards(AuthGuard)
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      example: {
        valid: true,
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'juan@example.com',
          rol: 'EMPLEADO',
          nombre: 'Juan Pérez',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  validateToken(@CurrentUser() user) {
    return {
      valid: true,
      user,
    };
  }
}
