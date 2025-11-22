import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { Roles } from '../../../common/decorators';
import { Rol } from '../../../database/entities/enums';

@ApiTags('Empresas')
@ApiBearerAuth()
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @Roles(Rol.ADMIN) // Solo ADMIN puede crear empresas
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
  @Roles(Rol.ADMIN, Rol.RRHH) // ADMIN y RRHH pueden ver empresas
  @ApiOperation({
    summary: 'Obtener todas las empresas',
    description: 'Lista todas las empresas registradas. Requiere rol ADMIN o RRHH.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas obtenida exitosamente',
  })
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.RRHH) // ADMIN y RRHH pueden ver detalles
  @ApiOperation({
    summary: 'Obtener una empresa por ID',
    description: 'Obtiene los detalles de una empresa específica. Requiere rol ADMIN o RRHH.',
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
    status: 404,
    description: 'Empresa no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(id);
  }

  @Get(':id/usuarios')
  @Roles(Rol.ADMIN, Rol.RRHH) // ADMIN y RRHH pueden ver usuarios de empresa
  @ApiOperation({
    summary: 'Obtener usuarios de una empresa',
    description: 'Lista todos los usuarios que pertenecen a una empresa específica. Requiere rol ADMIN o RRHH.',
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
    status: 404,
    description: 'Empresa no encontrada',
  })
  getUsuarios(@Param('id') id: string) {
    return this.empresasService.getUsuarios(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN) // Solo ADMIN puede actualizar empresas
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
  @Roles(Rol.ADMIN) // Solo ADMIN puede eliminar empresas
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
    status: 404,
    description: 'Empresa no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.empresasService.remove(id);
  }
}
