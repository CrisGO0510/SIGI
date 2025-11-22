import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO para enviar reportes de incapacidades a todas las empresas
 */
export class EnviarReporteTodasEmpresasDto {
  @ApiProperty({
    description: 'Fecha de inicio del período del reporte (formato: YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha de fin del período del reporte (formato: YYYY-MM-DD)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  fechaFin?: string;
}
