import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO para crear una nueva incapacidad
 * 
 * Estados posibles de una incapacidad en el sistema:
 * - REGISTRADA: Incapacidad recién creada, esperando validación inicial
 * - VALIDANDO: En proceso de validación de documentos y datos
 * - CORRECCION: Requiere correcciones por parte del empleado
 * - PENDIENTE_REVISION: Esperando revisión por RRHH
 * - EN_REVISION: Siendo revisada actualmente por RRHH
 * - APROBADA: Incapacidad aprobada, autorizada para pago
 * - RECHAZADA: Incapacidad rechazada por incumplir requisitos
 * - ESPERANDO_PAGO: Aprobada y en cola de pago
 * - PAGADA: Pago completado exitosamente
 * - CERRADA: Proceso finalizado y archivado
 */
export class CreateIncapacidadDto {
  @ApiProperty({
    description: 'ID del usuario que registra la incapacidad',
    example: '508b6786-ff5f-449f-9233-b33636ca8061',
  })
  @IsString()
  @IsNotEmpty()
  usuario_id: string;

  @ApiProperty({
    description: 'Fecha de inicio de la incapacidad',
    example: '2025-01-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @ApiProperty({
    description: 'Fecha de finalización de la incapacidad',
    example: '2025-01-20',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_fin: string;

  @ApiProperty({
    description: 'Motivo de la incapacidad',
    example: 'Gripe fuerte con fiebre',
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiProperty({
    description: 'Monto solicitado para la incapacidad (en pesos)',
    example: 150000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  monto_solicitado: number;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Se adjunta certificado médico',
    required: false,
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
