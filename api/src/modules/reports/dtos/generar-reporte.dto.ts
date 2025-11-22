import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { EstadoIncapacidad } from '../../../database/entities/enums';

export class GenerarReporteDto {
  @ApiProperty({
    description: 'Fecha de inicio del periodo a reportar',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha de fin del periodo a reportar',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({
    description: 'Filtrar por estado específico',
    enum: EstadoIncapacidad,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoIncapacidad)
  estado?: EstadoIncapacidad;
}
