import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { EmpresasService } from '../services/empresas.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from '../dtos';
import { Roles, Public } from '../../../common/decorators';
import { RoleGuard } from '../../../common/guards';
import { Rol } from '../../../database/entities/enums';

@ApiTags('Empresas')
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  /**
   * Endpoint PÚBLICO para listar empresas (solo ID y nombre)
   * Útil para el formulario de registro
   */
  @Public()
  @Get('lista')
  @ApiOperation({
    summary: 'Obtener lista de empresas (solo ID y nombre)',
    description: `
**Endpoint público - No requiere autenticación**

Retorna únicamente el ID y nombre de todas las empresas disponibles.
Este endpoint es útil para mostrar un selector de empresas en el formulario de registro.

**Datos retornados:**
- \`id\`: UUID de la empresa
- \`nombre\`: Nombre de la empresa

**Ejemplo de request:**
\`\`\`bash
curl -X GET http://localhost:3005/empresas/lista
\`\`\`

**Ejemplo de respuesta:**
\`\`\`json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Tech Solutions S.A."
  },
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "nombre": "Innovación Digital Corp."
  }
]
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas (ID y nombre) obtenida exitosamente',
  })
  async getEmpresasLista() {
    const empresas = await this.empresasService.findAll();
    // Retornar solo id y nombre
    return empresas.map((empresa) => ({
      id: empresa.id,
      nombre: empresa.nombre,
    }));
  }

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN) // Solo ADMIN puede crear empresas
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear una nueva empresa',
    description: 'Crea una nueva empresa en el sistema. Solo usuarios con rol ADMIN pueden ejecutar esta acción.',
  })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tienes permisos de ADMIN',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto - Ya existe una empresa con ese nombre',
  })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN) // Solo ADMIN puede ver todas las empresas completas
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener todas las empresas (información completa)',
    description: 'Lista todas las empresas registradas con todos sus datos. Requiere rol ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas obtenida exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tienes permisos de ADMIN',
  })
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN) // Solo ADMIN puede ver detalles
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener una empresa por ID',
    description: 'Obtiene los detalles de una empresa específica. Requiere rol ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tienes permisos de ADMIN',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(id);
  }

  @Get(':id/usuarios')
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN) // Solo ADMIN puede ver usuarios de empresa
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener usuarios de una empresa',
    description: 'Lista todos los usuarios que pertenecen a una empresa específica. Requiere rol ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios de la empresa obtenida exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tienes permisos de ADMIN',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  getUsuarios(@Param('id') id: string) {
    return this.empresasService.getUsuarios(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN) // Solo ADMIN puede actualizar empresas
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar una empresa',
    description: 'Actualiza los datos de una empresa existente. Solo usuarios con rol ADMIN pueden ejecutar esta acción.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tienes permisos de ADMIN',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto - Ya existe otra empresa con ese nombre',
  })
  update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN) // Solo ADMIN puede eliminar empresas
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar una empresa',
    description: 'Elimina una empresa del sistema. Solo usuarios con rol ADMIN pueden ejecutar esta acción.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa eliminada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tienes permisos de ADMIN',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.empresasService.remove(id);
  }
}
