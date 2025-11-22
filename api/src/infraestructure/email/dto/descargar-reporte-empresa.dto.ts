import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsString, IsIn } from 'class-validator';

/**
 * DTO para descargar reportes de incapacidades en PDF o CSV
 */
export class DescargarReporteEmpresaDto {
  @ApiProperty({
    description: 'ID de la empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  empresa_id: string;

  @ApiProperty({
    description: 'Formato del reporte (PDF o CSV)',
    example: 'PDF',
    enum: ['PDF', 'CSV'],
  })
  @IsNotEmpty()
  @IsIn(['PDF', 'CSV'])
  formato: 'PDF' | 'CSV';

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
