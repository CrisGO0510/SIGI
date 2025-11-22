import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { GenerarReporteDto, EstadisticasGeneralesDto } from '../dtos';
import { Roles } from '../../../common/decorators';
import { RoleGuard } from '../../../common/guards';
import { Rol } from '../../../database/entities/enums';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('estadisticas')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estadísticas generales de TODA LA EMPRESA',
    description: `
**Requiere rol RRHH o ADMIN**

⭐ **Este endpoint muestra estadísticas GLOBALES de TODOS los usuarios del sistema.**

Genera un reporte estadístico completo con:
- Total de incapacidades de toda la empresa
- Distribución por estado (aprobadas, rechazadas, pendientes)
- Montos totales solicitados y aprobados
- Promedio de días de incapacidad
- Distribución por mes (gráfica de barras)
- Top 5 motivos más frecuentes en la empresa

**Filtros opcionales (para análisis específicos):**
- \`fechaInicio\` y \`fechaFin\` - Analizar un periodo específico (ej: primer semestre)
- \`estado\` - Ver solo incapacidades en un estado (ej: solo aprobadas)

**Ejemplos:**

📊 **Estadísticas generales de toda la empresa:**
\`\`\`bash
curl -X GET "http://localhost:3005/reports/estadisticas" \\
  -H "Authorization: Bearer tu-token-rrhh-o-admin"
\`\`\`

📅 **Estadísticas del año 2024:**
\`\`\`bash
curl -X GET "http://localhost:3005/reports/estadisticas?fechaInicio=2024-01-01&fechaFin=2024-12-31" \\
  -H "Authorization: Bearer tu-token-rrhh-o-admin"
\`\`\`

✅ **Solo incapacidades aprobadas:**
\`\`\`bash
curl -X GET "http://localhost:3005/reports/estadisticas?estado=APROBADA" \\
  -H "Authorization: Bearer tu-token-rrhh-o-admin"
\`\`\`

⚠️ **Nota:** Para ver el reporte de UN SOLO empleado, usa \`GET /reports/usuario/:usuarioId\`
    `,
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    example: '2024-01-01',
    description: 'Fecha de inicio del periodo a analizar',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    example: '2024-12-31',
    description: 'Fecha de fin del periodo a analizar',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar solo por un estado específico (APROBADA, RECHAZADA, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas generadas exitosamente',
    type: EstadisticasGeneralesDto,
    schema: {
      example: {
        totalIncapacidades: 150,
        pendientesRevision: 25,
        aprobadas: 85,
        rechazadas: 15,
        pagadas: 75,
        montoTotalSolicitado: 45000000,
        montoTotalAprobado: 38250000,
        promediosDias: 5,
        porEstado: {
          REGISTRADA: 10,
          PENDIENTE_REVISION: 15,
          EN_REVISION: 10,
          APROBADA: 85,
          RECHAZADA: 15,
          PAGADA: 15,
        },
        porMes: [
          { mes: '2024-01', cantidad: 12 },
          { mes: '2024-02', cantidad: 15 },
          { mes: '2024-03', cantidad: 18 },
        ],
        motivosFrecuentes: [
          { motivo: 'gripe', cantidad: 45 },
          { motivo: 'COVID-19', cantidad: 30 },
          { motivo: 'lesión deportiva', cantidad: 20 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async getEstadisticasGenerales(
    @Query() dto: GenerarReporteDto,
  ): Promise<EstadisticasGeneralesDto> {
    return this.reportsService.getEstadisticasGenerales(dto);
  }

  @Get('usuario/:usuarioId')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @ApiOperation({
    summary: 'Obtener reporte individual de UN EMPLEADO específico',
    description: `
**Requiere rol RRHH o ADMIN**

👤 **Este endpoint muestra el reporte SOLO de UN empleado específico.**

Diferencias con \`/reports/estadisticas\`:
- ✅ Este endpoint: Reporte INDIVIDUAL de un empleado
- 📊 \`/reports/estadisticas\`: Reporte GLOBAL de toda la empresa

**Información incluida:**
- Total de incapacidades del empleado
- Total de días que ha estado incapacitado
- Monto total que ha solicitado
- Distribución de sus incapacidades por estado
- Historial: Últimas 5 incapacidades con detalles

**Útil para:**
- Revisar el historial médico de un empleado
- Evaluar patrones de ausentismo
- Preparar reuniones 1-on-1
- Análisis de casos específicos

**Ejemplo:**
\`\`\`bash
curl -X GET "http://localhost:3005/reports/usuario/123e4567-e89b-12d3-a456-426614174000" \\
  -H "Authorization: Bearer tu-token-rrhh-o-admin"
\`\`\`
    `,
  })
  @ApiParam({
    name: 'usuarioId',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte generado exitosamente',
    schema: {
      example: {
        usuarioId: '123e4567-e89b-12d3-a456-426614174000',
        totalIncapacidades: 12,
        totalDiasIncapacidad: 45,
        montoTotal: 3600000,
        porEstado: {
          APROBADA: 8,
          RECHAZADA: 2,
          PENDIENTE_REVISION: 2,
        },
        ultimasIncapacidades: [
          {
            id: 'inc-001',
            fechaInicio: '2024-11-01',
            fechaFin: '2024-11-05',
            motivo: 'Gripe',
            estado: 'APROBADA',
            monto: 300000,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async getReportePorUsuario(@Param('usuarioId') usuarioId: string) {
    return this.reportsService.getReportePorUsuario(usuarioId);
  }

  @Get('comparativo')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @ApiOperation({
    summary: 'Obtener reporte comparativo entre dos periodos',
    description: `
**Requiere rol RRHH o ADMIN**

Compara estadísticas entre dos periodos de tiempo y muestra:
- Estadísticas de ambos periodos
- Porcentaje de cambio en métricas clave
- Tendencias

**Ejemplo:**
\`\`\`bash
curl -X GET "http://localhost:3005/reports/comparativo?inicioActual=2024-01-01&finActual=2024-06-30&inicioAnterior=2023-01-01&finAnterior=2023-06-30" \\
  -H "Authorization: Bearer tu-token-rrhh-o-admin"
\`\`\`
    `,
  })
  @ApiQuery({
    name: 'inicioActual',
    required: true,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'finActual',
    required: true,
    example: '2024-06-30',
  })
  @ApiQuery({
    name: 'inicioAnterior',
    required: true,
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'finAnterior',
    required: true,
    example: '2023-06-30',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte comparativo generado',
    schema: {
      example: {
        periodoActual: {
          inicio: '2024-01-01',
          fin: '2024-06-30',
          estadisticas: { totalIncapacidades: 75 },
        },
        periodoAnterior: {
          inicio: '2023-01-01',
          fin: '2023-06-30',
          estadisticas: { totalIncapacidades: 60 },
        },
        comparacion: {
          totalIncapacidades: {
            actual: 75,
            anterior: 60,
            cambio: 25, // 25% de incremento
          },
          aprobadas: {
            actual: 50,
            anterior: 45,
            cambio: 11,
          },
          montoTotal: {
            actual: 22500000,
            anterior: 18000000,
            cambio: 25,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async getReporteComparativo(
    @Query('inicioActual') inicioActual: string,
    @Query('finActual') finActual: string,
    @Query('inicioAnterior') inicioAnterior: string,
    @Query('finAnterior') finAnterior: string,
  ) {
    return this.reportsService.getReporteComparativo(
      { inicio: inicioActual, fin: finActual },
      { inicio: inicioAnterior, fin: finAnterior },
    );
  }

  @Get('tendencias')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @ApiOperation({
    summary: 'Obtener reporte de tendencias (últimos 12 meses)',
    description: `
**Requiere rol RRHH o ADMIN**

Analiza las tendencias de incapacidades en los últimos 12 meses:
- Distribución mensual
- Tendencia general (creciente, decreciente, estable)
- Promedio mensual
- Pendiente de la tendencia

Útil para identificar patrones estacionales y tomar decisiones preventivas.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de tendencias generado',
    schema: {
      example: {
        porMes: [
          { mes: '2023-12', cantidad: 10 },
          { mes: '2024-01', cantidad: 12 },
          { mes: '2024-02', cantidad: 15 },
          { mes: '2024-03', cantidad: 18 },
          { mes: '2024-04', cantidad: 16 },
          { mes: '2024-05', cantidad: 20 },
          { mes: '2024-06', cantidad: 22 },
          { mes: '2024-07', cantidad: 19 },
          { mes: '2024-08', cantidad: 23 },
          { mes: '2024-09', cantidad: 25 },
          { mes: '2024-10', cantidad: 24 },
          { mes: '2024-11', cantidad: 26 },
        ],
        tendencia: 'creciente',
        promedioMensual: 19,
        pendiente: 1.23,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async getReporteTendencias() {
    return this.reportsService.getReporteTendencias();
  }

  @Get('dashboard')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @ApiOperation({
    summary: 'Obtener datos para dashboard ejecutivo',
    description: `
**Requiere rol RRHH o ADMIN**

Endpoint optimizado que retorna todos los datos necesarios para un dashboard:
- Estadísticas generales
- Tendencias mensuales
- Alertas y pendientes
- KPIs principales

Ideal para cargar un dashboard en una sola llamada.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del dashboard',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async getDashboard() {
    const [estadisticas, tendencias] = await Promise.all([
      this.reportsService.getEstadisticasGenerales(),
      this.reportsService.getReporteTendencias(),
    ]);

    return {
      estadisticas,
      tendencias,
      alertas: {
        pendientesRevision: estadisticas.pendientesRevision,
        tasaAprobacion: estadisticas.totalIncapacidades > 0
          ? Math.round((estadisticas.aprobadas / estadisticas.totalIncapacidades) * 100)
          : 0,
      },
      kpis: {
        totalIncapacidades: estadisticas.totalIncapacidades,
        montoTotal: estadisticas.montoTotalSolicitado,
        promediosDias: estadisticas.promediosDias,
        tasaAprobacion: estadisticas.totalIncapacidades > 0
          ? Math.round((estadisticas.aprobadas / estadisticas.totalIncapacidades) * 100)
          : 0,
      },
    };
  }
}
