import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { IncapacidadesService } from '../services';
import { CreateIncapacidadDto, UpdateIncapacidadDto } from '../dtos';
import { Roles } from '../../../common/decorators';
import { Rol, EstadoIncapacidad } from '../../../database/entities';

@ApiTags('incapacidades')
@ApiBearerAuth('JWT-auth')
@Controller('incapacidades')
export class IncapacidadesController {
  constructor(private readonly incapacidadesService: IncapacidadesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva incapacidad',
    description: `
Permite a un empleado registrar una nueva incapacidad médica.

**Requiere autenticación JWT**

**Validaciones:**
- La fecha de fin debe ser posterior a la fecha de inicio
- El monto solicitado debe ser mayor o igual a 0
- Todos los campos obligatorios deben estar presentes

**Estado inicial:** La incapacidad se crea con estado \`REGISTRADA\`
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Incapacidad creada exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        usuario_id: '508b6786-ff5f-449f-9233-b33636ca8061',
        fecha_registro: '2025-01-10T15:30:00.000Z',
        fecha_inicio: '2025-01-15T00:00:00.000Z',
        fecha_fin: '2025-01-20T00:00:00.000Z',
        motivo: 'Gripe fuerte con fiebre',
        monto_solicitado: 150000,
        estado: 'REGISTRADA',
        observaciones: 'Se adjunta certificado médico',
        created_at: '2025-01-10T15:30:00.000Z',
        updated_at: '2025-01-10T15:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos (ej: fecha_fin anterior a fecha_inicio)',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado - Token inválido o ausente',
  })
  create(@Body() createIncapacidadDto: CreateIncapacidadDto) {
    return this.incapacidadesService.create(createIncapacidadDto);
  }

  @Get()
  @Roles(Rol.RRHH, Rol.ADMIN)
  @ApiOperation({
    summary: 'Obtener todas las incapacidades',
    description: `
Obtiene la lista completa de todas las incapacidades registradas en el sistema.

**Requiere rol:** RRHH o ADMIN
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de incapacidades',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          usuario_id: '508b6786-ff5f-449f-9233-b33636ca8061',
          fecha_registro: '2025-01-10T15:30:00.000Z',
          fecha_inicio: '2025-01-15T00:00:00.000Z',
          fecha_fin: '2025-01-20T00:00:00.000Z',
          motivo: 'Gripe fuerte con fiebre',
          monto_solicitado: 150000,
          estado: 'REGISTRADA',
          observaciones: 'Se adjunta certificado médico',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  findAll() {
    return this.incapacidadesService.findAll();
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({
    summary: 'Obtener incapacidades de un usuario',
    description: `
Obtiene todas las incapacidades de un usuario específico.

**Un empleado solo puede ver sus propias incapacidades.**
**RRHH y ADMIN pueden ver las de cualquier usuario.**
    `,
  })
  @ApiParam({
    name: 'usuarioId',
    description: 'ID del usuario',
    example: '508b6786-ff5f-449f-9233-b33636ca8061',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de incapacidades del usuario',
  })
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.incapacidadesService.findByUsuario(usuarioId);
  }

  @Get('estado/:estado')
  @Roles(Rol.RRHH, Rol.ADMIN)
  @ApiOperation({
    summary: 'Obtener incapacidades por estado',
    description: 'Filtra incapacidades por su estado actual',
  })
  @ApiParam({
    name: 'estado',
    enum: EstadoIncapacidad,
    description: 'Estado de la incapacidad',
    example: EstadoIncapacidad.PENDIENTE_REVISION,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de incapacidades filtradas por estado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  findByEstado(@Param('estado') estado: EstadoIncapacidad) {
    return this.incapacidadesService.findByEstado(estado);
  }

  @Get('pendientes')
  @Roles(Rol.RRHH, Rol.ADMIN)
  @ApiOperation({
    summary: 'Obtener incapacidades pendientes de revisión',
    description: `
Obtiene todas las incapacidades que están en estado PENDIENTE_REVISION o EN_REVISION.

**Útil para el dashboard de RRHH.**
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de incapacidades pendientes',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  findPendientes() {
    return this.incapacidadesService.findPendientesRevision();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una incapacidad por ID',
    description: 'Obtiene los detalles completos de una incapacidad específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la incapacidad',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Incapacidad encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Incapacidad no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.incapacidadesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una incapacidad',
    description: `
Actualiza los datos de una incapacidad existente.

**Validaciones:**
- Si se actualizan las fechas, fecha_fin debe ser posterior a fecha_inicio
- Solo se actualizan los campos enviados en el body
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la incapacidad',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Incapacidad actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Incapacidad no encontrada',
  })
  update(@Param('id') id: string, @Body() updateIncapacidadDto: UpdateIncapacidadDto) {
    return this.incapacidadesService.update(id, updateIncapacidadDto);
  }

  @Patch(':id/estado')
  @Roles(Rol.RRHH, Rol.ADMIN)
  @ApiOperation({
    summary: 'Cambiar el estado de una incapacidad',
    description: `
Permite a RRHH o ADMIN cambiar el estado de una incapacidad en el flujo de aprobación.

**Flujo típico:**
1. REGISTRADA → VALIDANDO (validación automática)
2. VALIDANDO → PENDIENTE_REVISION (lista para RRHH)
3. PENDIENTE_REVISION → EN_REVISION (RRHH revisando)
4. EN_REVISION → APROBADA / RECHAZADA / CORRECCION
5. APROBADA → ESPERANDO_PAGO → PAGADA → CERRADA
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la incapacidad',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'estado',
    enum: EstadoIncapacidad,
    description: 'Nuevo estado',
    example: EstadoIncapacidad.APROBADA,
  })
  @ApiQuery({
    name: 'observaciones',
    required: false,
    description: 'Observaciones sobre el cambio de estado',
    example: 'Aprobada, documentación completa',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  @ApiResponse({
    status: 404,
    description: 'Incapacidad no encontrada',
  })
  cambiarEstado(
    @Param('id') id: string,
    @Query('estado') estado: EstadoIncapacidad,
    @Query('observaciones') observaciones?: string,
  ) {
    return this.incapacidadesService.cambiarEstado(id, estado, observaciones);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una incapacidad',
    description: `
Elimina permanentemente una incapacidad del sistema.

**⚠️ Solo ADMIN puede eliminar incapacidades.**
**⚠️ Esta acción es irreversible.**
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la incapacidad',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Incapacidad eliminada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMIN',
  })
  @ApiResponse({
    status: 404,
    description: 'Incapacidad no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.incapacidadesService.remove(id);
  }
}
