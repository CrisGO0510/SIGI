import { Injectable, Logger } from '@nestjs/common';
import { IncapacidadRepository } from '../../incapacities/repositories/incapacidad.repository';
import { GenerarReporteDto, EstadisticasGeneralesDto } from '../dtos';
import { EstadoIncapacidad } from '../../../database/entities/enums';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly incapacidadRepository: IncapacidadRepository,
  ) {}

  /**
   * Genera estadísticas generales de incapacidades
   */
  async getEstadisticasGenerales(
    dto?: GenerarReporteDto,
  ): Promise<EstadisticasGeneralesDto> {
    this.logger.log('Generando estadísticas generales de incapacidades');

    try {
      // Obtener todas las incapacidades (con filtros opcionales)
      let incapacidades = await this.incapacidadRepository.findAll();

      // Aplicar filtros si se proporcionan
      if (dto?.fechaInicio) {
        const fechaInicioFiltro = new Date(dto.fechaInicio);
        incapacidades = incapacidades.filter(
          (inc) => new Date(inc.fecha_inicio) >= fechaInicioFiltro,
        );
      }

      if (dto?.fechaFin) {
        const fechaFinFiltro = new Date(dto.fechaFin);
        incapacidades = incapacidades.filter(
          (inc) => new Date(inc.fecha_fin) <= fechaFinFiltro,
        );
      }

      if (dto?.estado) {
        incapacidades = incapacidades.filter(
          (inc) => inc.estado === dto.estado,
        );
      }

      // Calcular estadísticas
      const totalIncapacidades = incapacidades.length;

      const porEstado = incapacidades.reduce((acc, inc) => {
        acc[inc.estado] = (acc[inc.estado] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const pendientesRevision =
        (porEstado[EstadoIncapacidad.PENDIENTE_REVISION] || 0) +
        (porEstado[EstadoIncapacidad.EN_REVISION] || 0);

      const aprobadas = porEstado[EstadoIncapacidad.APROBADA] || 0;
      const rechazadas = porEstado[EstadoIncapacidad.RECHAZADA] || 0;
      const pagadas = porEstado[EstadoIncapacidad.PAGADA] || 0;

      // Calcular montos
      const montoTotalSolicitado = incapacidades.reduce(
        (sum, inc) => sum + (inc.monto_solicitado || 0),
        0,
      );

      const montoTotalAprobado = incapacidades
        .filter((inc) => inc.estado === EstadoIncapacidad.APROBADA || inc.estado === EstadoIncapacidad.PAGADA)
        .reduce((sum, inc) => sum + (inc.monto_solicitado || 0), 0);

      // Calcular promedio de días
      const totalDias = incapacidades.reduce((sum, inc) => {
        const dias = Math.ceil(
          (new Date(inc.fecha_fin).getTime() -
            new Date(inc.fecha_inicio).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return sum + dias;
      }, 0);

      const promediosDias =
        totalIncapacidades > 0
          ? Math.round(totalDias / totalIncapacidades)
          : 0;

      // Estadísticas por mes
      const porMes = this.calcularPorMes(incapacidades);

      // Top 5 motivos más frecuentes
      const motivosFrecuentes = this.calcularMotivosFrecuentes(incapacidades);

      return {
        totalIncapacidades,
        pendientesRevision,
        aprobadas,
        rechazadas,
        pagadas,
        montoTotalSolicitado,
        montoTotalAprobado,
        promediosDias,
        porEstado,
        porMes,
        motivosFrecuentes,
      };
    } catch (error) {
      this.logger.error(`Error generando estadísticas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera reporte detallado por usuario
   */
  async getReportePorUsuario(usuarioId: string): Promise<any> {
    this.logger.log(`Generando reporte para usuario: ${usuarioId}`);

    const incapacidades = await this.incapacidadRepository.findByUsuario(usuarioId);

    const totalIncapacidades = incapacidades.length;
    const totalDiasIncapacidad = incapacidades.reduce((sum, inc) => {
      const dias = Math.ceil(
        (new Date(inc.fecha_fin).getTime() -
          new Date(inc.fecha_inicio).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return sum + dias;
    }, 0);

    const montoTotal = incapacidades.reduce(
      (sum, inc) => sum + (inc.monto_solicitado || 0),
      0,
    );

    const porEstado = incapacidades.reduce((acc, inc) => {
      acc[inc.estado] = (acc[inc.estado] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const ultimasIncapacidades = incapacidades
      .sort(
        (a, b) =>
          new Date(b.fecha_registro).getTime() -
          new Date(a.fecha_registro).getTime(),
      )
      .slice(0, 5);

    return {
      usuarioId,
      totalIncapacidades,
      totalDiasIncapacidad,
      montoTotal,
      porEstado,
      ultimasIncapacidades: ultimasIncapacidades.map((inc) => ({
        id: inc.id,
        fechaInicio: inc.fecha_inicio,
        fechaFin: inc.fecha_fin,
        motivo: inc.motivo,
        estado: inc.estado,
        monto: inc.monto_solicitado,
      })),
    };
  }

  /**
   * Genera reporte comparativo por periodo
   */
  async getReporteComparativo(
    periodoActual: { inicio: string; fin: string },
    periodoAnterior: { inicio: string; fin: string },
  ): Promise<any> {
    this.logger.log('Generando reporte comparativo');

    const estadisticasActuales = await this.getEstadisticasGenerales({
      fechaInicio: periodoActual.inicio,
      fechaFin: periodoActual.fin,
    });

    const estadisticasAnteriores = await this.getEstadisticasGenerales({
      fechaInicio: periodoAnterior.inicio,
      fechaFin: periodoAnterior.fin,
    });

    const calcularCambio = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return Math.round(((actual - anterior) / anterior) * 100);
    };

    return {
      periodoActual: {
        inicio: periodoActual.inicio,
        fin: periodoActual.fin,
        estadisticas: estadisticasActuales,
      },
      periodoAnterior: {
        inicio: periodoAnterior.inicio,
        fin: periodoAnterior.fin,
        estadisticas: estadisticasAnteriores,
      },
      comparacion: {
        totalIncapacidades: {
          actual: estadisticasActuales.totalIncapacidades,
          anterior: estadisticasAnteriores.totalIncapacidades,
          cambio: calcularCambio(
            estadisticasActuales.totalIncapacidades,
            estadisticasAnteriores.totalIncapacidades,
          ),
        },
        aprobadas: {
          actual: estadisticasActuales.aprobadas,
          anterior: estadisticasAnteriores.aprobadas,
          cambio: calcularCambio(
            estadisticasActuales.aprobadas,
            estadisticasAnteriores.aprobadas,
          ),
        },
        montoTotal: {
          actual: estadisticasActuales.montoTotalSolicitado,
          anterior: estadisticasAnteriores.montoTotalSolicitado,
          cambio: calcularCambio(
            estadisticasActuales.montoTotalSolicitado,
            estadisticasAnteriores.montoTotalSolicitado,
          ),
        },
      },
    };
  }

  /**
   * Calcula estadísticas por mes
   */
  private calcularPorMes(incapacidades: any[]): { mes: string; cantidad: number }[] {
    const porMes: { [key: string]: number } = {};

    incapacidades.forEach((inc) => {
      const fecha = new Date(inc.fecha_registro);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      porMes[mesAnio] = (porMes[mesAnio] || 0) + 1;
    });

    return Object.entries(porMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, cantidad]) => ({ mes, cantidad }));
  }

  /**
   * Calcula los motivos más frecuentes
   */
  private calcularMotivosFrecuentes(
    incapacidades: any[],
  ): { motivo: string; cantidad: number }[] {
    const motivosCount: { [key: string]: number } = {};

    incapacidades.forEach((inc) => {
      if (inc.motivo) {
        const motivoNormalizado = inc.motivo.toLowerCase().trim();
        motivosCount[motivoNormalizado] =
          (motivosCount[motivoNormalizado] || 0) + 1;
      }
    });

    return Object.entries(motivosCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([motivo, cantidad]) => ({ motivo, cantidad }));
  }

  /**
   * Genera reporte de tendencias (últimos 12 meses)
   */
  async getReporteTendencias(): Promise<any> {
    this.logger.log('Generando reporte de tendencias');

    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 12);

    const incapacidades = await this.incapacidadRepository.findByDateRange(
      fechaInicio,
      fechaFin,
    );

    const porMes = this.calcularPorMes(incapacidades);

    // Calcular tendencia (regresión lineal simple)
    const n = porMes.length;
    if (n === 0) {
      return {
        porMes: [],
        tendencia: 'sin datos',
        promedioMensual: 0,
      };
    }

    const sumX = porMes.reduce((sum, _, i) => sum + i, 0);
    const sumY = porMes.reduce((sum, item) => sum + item.cantidad, 0);
    const sumXY = porMes.reduce((sum, item, i) => sum + i * item.cantidad, 0);
    const sumX2 = porMes.reduce((sum, _, i) => sum + i * i, 0);

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const promedioMensual = Math.round(sumY / n);

    let tendencia = 'estable';
    if (pendiente > 0.5) tendencia = 'creciente';
    if (pendiente < -0.5) tendencia = 'decreciente';

    return {
      porMes,
      tendencia,
      promedioMensual,
      pendiente: Math.round(pendiente * 100) / 100,
    };
  }
}
