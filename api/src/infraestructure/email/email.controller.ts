import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto, EnviarReporteEmpresaDto, EnviarReporteTodasEmpresasDto } from './dto';
import { Roles } from '../../common/decorators';
import { RoleGuard } from '../../common/guards';
import { Rol, EstadoIncapacidad } from '../../database/entities/enums';
import { Incapacidad } from '../../database/entities';
import { EmpresasService } from '../../modules/empresas/services/empresas.service';
import { IncapacidadRepository } from '../../modules/incapacities/repositories/incapacidad.repository';
import { DocumentoRepository } from '../../modules/documents/repositories/documento.repository';
import { SupabaseStorageService } from '../../infraestructure/file-storage/supabase-storage.service';

@ApiTags('email')
@ApiBearerAuth('JWT-auth')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly empresasService: EmpresasService,
    private readonly incapacidadRepository: IncapacidadRepository,
    private readonly documentoRepository: DocumentoRepository,
    private readonly storageService: SupabaseStorageService,
  ) {}

  @Post('send')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email personalizado',
    description: `
**Requiere rol RRHH o ADMIN**

Envía un email personalizado con contenido HTML o texto plano.

**Configuración requerida:**
Asegúrate de tener configuradas las siguientes variables de entorno:
- \`MAIL_HOST\` - Servidor SMTP (ej: smtp.gmail.com)
- \`MAIL_PORT\` - Puerto SMTP (ej: 587)
- \`MAIL_USER\` - Usuario del correo
- \`MAIL_PASSWORD\` - Contraseña del correo
- \`MAIL_FROM_NAME\` - Nombre del remitente (opcional)
- \`MAIL_FROM_EMAIL\` - Email del remitente (opcional)

**Ejemplo con Gmail:**
1. Activa "Verificación en dos pasos" en tu cuenta de Gmail
2. Genera una "Contraseña de aplicación" en: https://myaccount.google.com/apppasswords
3. Usa esa contraseña en \`MAIL_PASSWORD\`

**Ejemplo de request:**
\`\`\`bash
curl -X POST http://localhost:3005/email/send \\
  -H "Authorization: Bearer tu-token-rrhh-o-admin" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "empleado@example.com",
    "subject": "Actualización de tu Incapacidad",
    "html": "<h1>Hola</h1><p>Tu incapacidad ha sido aprobada.</p>",
    "text": "Hola, tu incapacidad ha sido aprobada."
  }'
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado exitosamente',
    schema: {
      example: {
        success: true,
        messageId: '<abc123@smtp.gmail.com>',
        message: 'Email enviado exitosamente a: empleado@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error al enviar el email',
    schema: {
      example: {
        success: false,
        error: 'Invalid login: 535-5.7.8 Username and Password not accepted',
        message: 'Error al enviar el email. Verifica la configuración SMTP.',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async sendEmail(@Body() dto: SendEmailDto) {
    const result = await this.emailService.sendEmail(dto);

    if (result.success) {
      return {
        ...result,
        message: `Email enviado exitosamente a: ${Array.isArray(dto.to) ? dto.to.join(', ') : dto.to}`,
      };
    } else {
      return {
        ...result,
        message: 'Error al enviar el email. Verifica la configuración SMTP.',
      };
    }
  }

  @Post('test')
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email de prueba',
    description: `
**Solo ADMIN**

Envía un email de prueba para verificar que la configuración SMTP funciona correctamente.

**Ejemplo:**
\`\`\`bash
curl -X POST http://localhost:3005/email/test \\
  -H "Authorization: Bearer tu-token-admin" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "tu-email@example.com"
  }'
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Email de prueba enviado',
    schema: {
      example: {
        success: true,
        messageId: '<abc123@smtp.gmail.com>',
        message: 'Email de prueba enviado exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMIN',
  })
  async sendTestEmail(@Body('to') to: string) {
    const result = await this.emailService.sendEmail({
      to,
      subject: 'Email de Prueba - SIGI',
      html: `
        <h1>✅ Configuración SMTP Correcta</h1>
        <p>Este es un email de prueba del sistema SIGI.</p>
        <p>Si recibes este mensaje, significa que la configuración de correo está funcionando correctamente.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Email de prueba generado el ${new Date().toLocaleString()}</p>
      `,
      text: 'Email de prueba de SIGI. Si recibes este mensaje, la configuración SMTP funciona correctamente.',
    });

    return {
      ...result,
      message: result.success
        ? 'Email de prueba enviado exitosamente'
        : 'Error al enviar email de prueba. Revisa la configuración SMTP.',
    };
  }

  @Post('welcome')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email de bienvenida',
    description: 'Envía un email de bienvenida a un nuevo usuario registrado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de bienvenida enviado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async sendWelcomeEmail(
    @Body('to') to: string,
    @Body('nombre') nombre: string,
    @Body('rol') rol: string,
  ) {
    const result = await this.emailService.sendWelcomeEmail(to, nombre, rol);

    return {
      ...result,
      message: result.success
        ? 'Email de bienvenida enviado exitosamente'
        : 'Error al enviar email de bienvenida',
    };
  }

  @Post('reporte-empresa')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar reporte de incapacidades al correo de la empresa',
    description: `
**Requiere rol RRHH o ADMIN**

Envía un reporte estadístico de las solicitudes de incapacidad de los empleados de una empresa.

El reporte incluye:
- Total de solicitudes
- Cantidad de solicitudes aprobadas, rechazadas y pendientes
- Monto total de incapacidades aprobadas
- Tabla detallada con información de cada solicitud

**Filtros opcionales:**
- \`fechaInicio\`: Filtra solicitudes desde esta fecha (formato: YYYY-MM-DD)
- \`fechaFin\`: Filtra solicitudes hasta esta fecha (formato: YYYY-MM-DD)

**Ejemplo de request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/email/reporte-empresa \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "empresa_id": "550e8400-e29b-41d4-a716-446655440000",
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-12-31"
  }'
\`\`\`
`,
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte enviado exitosamente al correo de la empresa',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async sendReporteEmpresa(@Body() dto: EnviarReporteEmpresaDto) {
    // 1. Obtener información de la empresa
    const empresa = await this.empresasService.findOne(dto.empresa_id);
    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${dto.empresa_id} no encontrada`);
    }

    // 2. Obtener usuarios de la empresa para filtrar sus incapacidades
    const usuarios = await this.empresasService.getUsuarios(dto.empresa_id);
    const usuariosIds = usuarios.map((u) => u.id);

    if (usuariosIds.length === 0) {
      throw new BadRequestException(
        'La empresa no tiene empleados registrados',
      );
    }

    // 3. Obtener todas las incapacidades de los usuarios de la empresa
    const todasIncapacidades: Array<Incapacidad & { usuario?: { nombre: string; apellido: string } }> = [];
    
    for (const usuarioId of usuariosIds) {
      const incapacidadesUsuario = await this.incapacidadRepository.findByUsuario(usuarioId);
      
      // Obtener info del usuario para cada incapacidad
      const usuario = usuarios.find((u) => u.id === usuarioId);
      const incapacidadesConUsuario = incapacidadesUsuario.map((inc) => ({
        ...inc,
        usuario: usuario ? { nombre: usuario.nombre, apellido: usuario.apellido } : undefined,
      }));
      
      todasIncapacidades.push(...incapacidadesConUsuario);
    }

    // 4. Aplicar filtros de fecha si se proporcionan
    let incapacidadesFiltradas = todasIncapacidades;

    if (dto.fechaInicio) {
      const fechaInicio = new Date(dto.fechaInicio);
      incapacidadesFiltradas = incapacidadesFiltradas.filter(
        (inc) => new Date(inc.fecha_inicio) >= fechaInicio,
      );
    }

    if (dto.fechaFin) {
      const fechaFin = new Date(dto.fechaFin);
      incapacidadesFiltradas = incapacidadesFiltradas.filter(
        (inc) => new Date(inc.fecha_inicio) <= fechaFin,
      );
    }

    // 5. Calcular estadísticas
    const estadisticas = {
      total: incapacidadesFiltradas.length,
      aprobadas: incapacidadesFiltradas.filter(
        (inc) => inc.estado === EstadoIncapacidad.APROBADA,
      ).length,
      rechazadas: incapacidadesFiltradas.filter(
        (inc) => inc.estado === EstadoIncapacidad.RECHAZADA,
      ).length,
      pendientes: incapacidadesFiltradas.filter(
        (inc) =>
          inc.estado === EstadoIncapacidad.REGISTRADA ||
          inc.estado === EstadoIncapacidad.PENDIENTE_REVISION ||
          inc.estado === EstadoIncapacidad.EN_REVISION,
      ).length,
      montoTotal: incapacidadesFiltradas
        .filter((inc) => inc.estado === EstadoIncapacidad.APROBADA)
        .reduce((sum, inc) => sum + (inc.monto_solicitado || 0), 0),
    };

    // 6. Calcular días de incapacidad
    const calcularDias = (fechaInicio: Date, fechaFin: Date): number => {
      const diff = new Date(fechaFin).getTime() - new Date(fechaInicio).getTime();
      return Math.ceil(diff / (1000 * 3600 * 24)) + 1; // +1 para incluir ambos días
    };

    // 7. Obtener documentos y formatear incapacidades para el reporte
    const incapacidadesFormateadas = await Promise.all(
      incapacidadesFiltradas.map(async (inc) => {
        // Obtener los documentos de esta incapacidad
        const documentos = await this.documentoRepository.findByIncapacidad(inc.id);
        
        // Generar URL del primer documento (si existe)
        let documentoUrl: string | undefined = undefined;
        if (documentos.length > 0 && documentos[0].storage_path) {
          documentoUrl = this.storageService.getPublicUrl(documentos[0].storage_path);
        }

        return {
          empleado: `${inc.usuario?.nombre || 'N/A'} ${inc.usuario?.apellido || ''}`.trim(),
          motivo: inc.motivo,
          fechaInicio: new Date(inc.fecha_inicio).toLocaleDateString('es-CO'),
          fechaFin: new Date(inc.fecha_fin).toLocaleDateString('es-CO'),
          dias: calcularDias(inc.fecha_inicio, inc.fecha_fin),
          estado: inc.estado,
          monto: inc.monto_solicitado || 0,
          documentoUrl,
        };
      }),
    );

    // 8. Preparar información del período
    const periodo = {
      inicio: dto.fechaInicio
        ? new Date(dto.fechaInicio).toLocaleDateString('es-CO')
        : 'Desde el inicio',
      fin: dto.fechaFin
        ? new Date(dto.fechaFin).toLocaleDateString('es-CO')
        : 'Hasta la fecha',
    };

    // 9. Enviar el email
    const result = await this.emailService.sendReporteEmpresa(
      empresa.correo_contacto,
      empresa.nombre,
      periodo,
      incapacidadesFormateadas,
      estadisticas,
    );

    return {
      ...result,
      message: result.success
        ? `Reporte enviado exitosamente a ${empresa.correo_contacto}`
        : 'Error al enviar el reporte',
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        correo: empresa.correo_contacto,
      },
      estadisticas,
    };
  }

  @Post('reporte-todas-empresas')
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar reportes de incapacidades a TODAS las empresas registradas',
    description: `
**Requiere rol ADMIN**

Envía reportes estadísticos de incapacidades a todas las empresas registradas en el sistema.
Cada empresa recibirá un reporte personalizado con las incapacidades de sus propios empleados.

Este endpoint es útil para:
- Envío masivo de reportes mensuales
- Reportes trimestrales o anuales
- Automatización con cron jobs o tareas programadas

**Filtros opcionales:**
- \`fechaInicio\`: Filtra solicitudes desde esta fecha (formato: YYYY-MM-DD)
- \`fechaFin\`: Filtra solicitudes hasta esta fecha (formato: YYYY-MM-DD)

**Comportamiento:**
- Recorre todas las empresas registradas
- Para cada empresa, genera su reporte personalizado
- Envía el reporte al correo de contacto de la empresa
- Retorna estadísticas de envíos exitosos y fallidos

**Ejemplo de request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/email/reporte-todas-empresas \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-12-31"
  }'
\`\`\`

**Para enviar reportes del mes anterior:**
\`\`\`bash
curl -X POST http://localhost:3000/api/email/reporte-todas-empresas \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{}'
\`\`\`
`,
  })
  @ApiResponse({
    status: 200,
    description: 'Reportes enviados (incluye detalles de éxitos y fallos)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol ADMIN',
  })
  async sendReporteTodasEmpresas(@Body() dto: EnviarReporteTodasEmpresasDto) {
    // 1. Obtener todas las empresas
    const empresas = await this.empresasService.findAll();

    if (empresas.length === 0) {
      throw new NotFoundException('No hay empresas registradas en el sistema');
    }

    // 2. Preparar información del período
    const periodo = {
      inicio: dto.fechaInicio
        ? new Date(dto.fechaInicio).toLocaleDateString('es-CO')
        : 'Desde el inicio',
      fin: dto.fechaFin
        ? new Date(dto.fechaFin).toLocaleDateString('es-CO')
        : 'Hasta la fecha',
    };

    // 3. Enviar reportes a cada empresa
    const resultados: Array<{
      empresa: string;
      correo: string;
      success: boolean;
      messageId?: string;
      estadisticas?: any;
      error?: string;
    }> = [];
    let exitosos = 0;
    let fallidos = 0;

    for (const empresa of empresas) {
      try {
        // Obtener usuarios de la empresa
        const usuarios = await this.empresasService.getUsuarios(empresa.id);

        if (usuarios.length === 0) {
          resultados.push({
            empresa: empresa.nombre,
            correo: empresa.correo_contacto,
            success: false,
            error: 'La empresa no tiene empleados registrados',
          });
          fallidos++;
          continue;
        }

        // Recopilar todas las incapacidades de los empleados
        let todasIncapacidades: any[] = [];
        for (const usuario of usuarios) {
          const incapacidadesUsuario =
            await this.incapacidadRepository.findByUsuario(usuario.id);
          const incapacidadesConUsuario = incapacidadesUsuario.map((inc) => ({
            ...inc,
            usuario: {
              nombre: usuario.nombre,
              apellido: usuario.apellido,
            },
          }));
          todasIncapacidades.push(...incapacidadesConUsuario);
        }

        // Aplicar filtros de fecha
        let incapacidadesFiltradas = todasIncapacidades;

        if (dto.fechaInicio) {
          const fechaInicio = new Date(dto.fechaInicio);
          incapacidadesFiltradas = incapacidadesFiltradas.filter(
            (inc) => new Date(inc.fecha_inicio) >= fechaInicio,
          );
        }

        if (dto.fechaFin) {
          const fechaFin = new Date(dto.fechaFin);
          incapacidadesFiltradas = incapacidadesFiltradas.filter(
            (inc) => new Date(inc.fecha_inicio) <= fechaFin,
          );
        }

        // Si no hay incapacidades en el período, no enviar email
        if (incapacidadesFiltradas.length === 0) {
          resultados.push({
            empresa: empresa.nombre,
            correo: empresa.correo_contacto,
            success: false,
            error: 'No hay incapacidades en el período seleccionado',
          });
          fallidos++;
          continue;
        }

        // Calcular estadísticas
        const estadisticas = {
          total: incapacidadesFiltradas.length,
          aprobadas: incapacidadesFiltradas.filter(
            (inc) => inc.estado === EstadoIncapacidad.APROBADA,
          ).length,
          rechazadas: incapacidadesFiltradas.filter(
            (inc) => inc.estado === EstadoIncapacidad.RECHAZADA,
          ).length,
          pendientes: incapacidadesFiltradas.filter(
            (inc) =>
              inc.estado === EstadoIncapacidad.REGISTRADA ||
              inc.estado === EstadoIncapacidad.PENDIENTE_REVISION ||
              inc.estado === EstadoIncapacidad.EN_REVISION,
          ).length,
          montoTotal: incapacidadesFiltradas
            .filter((inc) => inc.estado === EstadoIncapacidad.APROBADA)
            .reduce((sum, inc) => sum + (inc.monto_solicitado || 0), 0),
        };

        // Calcular días de incapacidad
        const calcularDias = (fechaInicio: Date, fechaFin: Date): number => {
          const diff =
            new Date(fechaFin).getTime() - new Date(fechaInicio).getTime();
          return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
        };

        // Obtener documentos y formatear incapacidades
        const incapacidadesFormateadas = await Promise.all(
          incapacidadesFiltradas.map(async (inc) => {
            const documentos = await this.documentoRepository.findByIncapacidad(
              inc.id,
            );

            let documentoUrl: string | undefined = undefined;
            if (documentos.length > 0 && documentos[0].storage_path) {
              documentoUrl = this.storageService.getPublicUrl(
                documentos[0].storage_path,
              );
            }

            return {
              empleado: `${inc.usuario?.nombre || 'N/A'} ${inc.usuario?.apellido || ''}`.trim(),
              motivo: inc.motivo,
              fechaInicio: new Date(inc.fecha_inicio).toLocaleDateString(
                'es-CO',
              ),
              fechaFin: new Date(inc.fecha_fin).toLocaleDateString('es-CO'),
              dias: calcularDias(inc.fecha_inicio, inc.fecha_fin),
              estado: inc.estado,
              monto: inc.monto_solicitado || 0,
              documentoUrl,
            };
          }),
        );

        // Enviar el email
        const result = await this.emailService.sendReporteEmpresa(
          empresa.correo_contacto,
          empresa.nombre,
          periodo,
          incapacidadesFormateadas,
          estadisticas,
        );

        resultados.push({
          empresa: empresa.nombre,
          correo: empresa.correo_contacto,
          success: result.success,
          messageId: result.messageId,
          estadisticas,
        });

        if (result.success) {
          exitosos++;
        } else {
          fallidos++;
        }
      } catch (error) {
        resultados.push({
          empresa: empresa.nombre,
          correo: empresa.correo_contacto,
          success: false,
          error: error.message,
        });
        fallidos++;
      }
    }

    return {
      message: `Reportes procesados: ${exitosos} exitosos, ${fallidos} fallidos`,
      periodo,
      totalEmpresas: empresas.length,
      exitosos,
      fallidos,
      resultados,
    };
  }
}
