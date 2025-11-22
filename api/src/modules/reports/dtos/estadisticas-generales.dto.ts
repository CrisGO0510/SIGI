import { ApiProperty } from '@nestjs/swagger';

export class EstadisticasGeneralesDto {
  @ApiProperty({ description: 'Total de incapacidades registradas' })
  totalIncapacidades: number;

  @ApiProperty({ description: 'Incapacidades pendientes de revisión' })
  pendientesRevision: number;

  @ApiProperty({ description: 'Incapacidades aprobadas' })
  aprobadas: number;

  @ApiProperty({ description: 'Incapacidades rechazadas' })
  rechazadas: number;

  @ApiProperty({ description: 'Incapacidades pagadas' })
  pagadas: number;

  @ApiProperty({ description: 'Monto total solicitado' })
  montoTotalSolicitado: number;

  @ApiProperty({ description: 'Monto total aprobado' })
  montoTotalAprobado: number;

  @ApiProperty({ description: 'Días promedio de duración' })
  promediosDias: number;

  @ApiProperty({ description: 'Estadísticas por estado' })
  porEstado: { [key: string]: number };

  @ApiProperty({ description: 'Estadísticas por mes' })
  porMes: { mes: string; cantidad: number }[];

  @ApiProperty({ description: 'Top 5 motivos más frecuentes' })
  motivosFrecuentes: { motivo: string; cantidad: number }[];
}
