import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { EstadoIncapacidad } from '../../../database/entities';

export class UpdateIncapacidadDto {
  @ApiProperty({
    description: 'Fecha de inicio de la incapacidad',
    example: '2025-01-15',
    type: String,
    format: 'date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fecha_inicio?: string;

  @ApiProperty({
    description: 'Fecha de finalización de la incapacidad',
    example: '2025-01-20',
    type: String,
    format: 'date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @ApiProperty({
    description: 'Motivo de la incapacidad',
    example: 'Gripe fuerte con fiebre',
    required: false,
  })
  @IsString()
  @IsOptional()
  motivo?: string;

  @ApiProperty({
    description: 'Monto solicitado para la incapacidad (en pesos)',
    example: 150000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monto_solicitado?: number;

  @ApiProperty({
    description: 'Estado de la incapacidad',
    enum: EstadoIncapacidad,
    example: EstadoIncapacidad.EN_REVISION,
    required: false,
  })
  @IsEnum(EstadoIncapacidad)
  @IsOptional()
  estado?: EstadoIncapacidad;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Se requiere documentación adicional',
    required: false,
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
