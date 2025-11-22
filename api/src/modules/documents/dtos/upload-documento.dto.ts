import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UploadDocumentoDto {
  @ApiProperty({
    description: 'ID de la incapacidad a la que pertenece el documento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  incapacidadId: string;

  @ApiProperty({
    description: 'Tipo de documento (ej: "pdf_incapacidad", "soporte_medico")',
    example: 'pdf_incapacidad',
  })
  @IsString()
  @IsNotEmpty()
  tipoDocumento: string;

  @ApiProperty({
    description: 'Descripción opcional del documento',
    example: 'Incapacidad por gripe del 15 al 20 de noviembre',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
