import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RoleGuard } from '../../../common/guards/role.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Rol } from '../../../database/entities/enums';
import { UserRepository } from '../repositories/user.repository';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * GET /users/me
   * Obtener perfil del usuario autenticado (cualquier rol)
   */
  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        message: 'Perfil del usuario autenticado',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'juan@example.com',
          rol: 'EMPLEADO',
          nombre: 'Juan Pérez',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getMyProfile(@CurrentUser() user) {
    return {
      message: 'Perfil del usuario autenticado',
      user,
    };
  }

  /**
   * GET /users
   * Listar todos los usuarios (solo ADMIN y RRHH)
   */
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN, Rol.RRHH)
  @Get()
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description: `
**Requiere autenticación y rol ADMIN o RRHH**

**Ejemplo de request:**
\`\`\`bash
curl -X GET http://localhost:3005/users \\
  -H "Authorization: Bearer tu-token-de-admin-o-rrhh"
\`\`\`

**Nota:** Si tu token es de un usuario EMPLEADO, recibirás un error 403 Forbidden.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    schema: {
      example: {
        message: 'Lista de usuarios',
        total: 4,
        users: [
          {
            id: 'd92301cb-6fae-49f6-bd33-1ad00fb02ad8',
            nombre: 'Administrador Sistema',
            email: 'admin@sigi.com',
            rol: 'ADMIN',
            created_at: '2025-11-21T22:45:21.221599+00:00',
          },
          {
            id: '508b6786-ff5f-449f-9233-b33636ca8061',
            nombre: 'Usuario Prueba',
            email: 'test@test.com',
            rol: 'EMPLEADO',
            created_at: '2025-11-21T23:21:55.824707+00:00',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado - Token no proporcionado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Requiere rol ADMIN o RRHH',
  })
  async getAllUsers() {
    const users = await this.userRepository.findAll();
    return {
      message: 'Lista de usuarios',
      total: users.length,
      users: users.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        created_at: u.created_at,
      })),
    };
  }

  /**
   * GET /users/admins
   * Listar solo administradores (solo ADMIN)
   */
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN)
  @Get('admins')
  @ApiOperation({
    summary: 'Listar administradores',
    description: 'Solo accesible para usuarios con rol ADMIN',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de administradores',
    schema: {
      example: {
        message: 'Lista de administradores',
        total: 1,
        admins: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            nombre: 'Admin Sistema',
            email: 'admin@sigi.com',
            rol: 'ADMIN',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Requiere rol ADMIN',
  })
  async getAdmins() {
    const admins = await this.userRepository.findByRole(Rol.ADMIN);
    return {
      message: 'Lista de administradores',
      total: admins.length,
      admins,
    };
  }

  /**
   * GET /users/rrhh
   * Listar personal de RRHH (solo ADMIN y RRHH)
   */
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN, Rol.RRHH)
  @Get('rrhh')
  @ApiOperation({
    summary: 'Listar personal de RRHH',
    description: 'Solo accesible para usuarios con rol ADMIN o RRHH',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de personal RRHH',
    schema: {
      example: {
        message: 'Lista de personal RRHH',
        total: 1,
        rrhh: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            nombre: 'Personal RRHH',
            email: 'rrhh@sigi.com',
            rol: 'RRHH',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Requiere rol ADMIN o RRHH',
  })
  async getRRHH() {
    const rrhh = await this.userRepository.findByRole(Rol.RRHH);
    return {
      message: 'Lista de personal RRHH',
      total: rrhh.length,
      rrhh,
    };
  }
}
