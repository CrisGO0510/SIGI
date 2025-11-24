import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class CambiarValidacionDto {
  @ApiProperty({
    description: 'Estado de validación del documento',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  validado: boolean;

  @ApiProperty({
    description: 'Detalle o comentario sobre la validación',
    example: 'Documento verificado y aprobado por RRHH',
    required: false,
  })
  @IsString()
  @IsOptional()
  detalle_validacion?: string;
}
