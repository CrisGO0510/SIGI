import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnviarReporteEmpresaDto {
  @ApiProperty({
    description: 'ID de la empresa a la que se enviará el reporte',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'El empresa_id es obligatorio' })
  @IsUUID('4', { message: 'El empresa_id debe ser un UUID válido' })
  empresa_id: string;

  @ApiProperty({
    description: 'Fecha de inicio del período del reporte (YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha de fin del período del reporte (YYYY-MM-DD)',
    example: '2025-11-22',
    required: false,
  })
  @IsOptional()
  @IsString()
  fechaFin?: string;
}
