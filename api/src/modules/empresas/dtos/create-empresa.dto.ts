import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpresaDto {
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Tech Solutions S.A.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({
    description: 'Correo de contacto de la empresa',
    example: 'contacto@techsolutions.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo_contacto: string;

  @ApiProperty({
    description: 'Dirección física de la empresa',
    example: 'Av. Principal 123, Ciudad',
    required: false,
  })
  @IsOptional()
  @IsString()
  direccion?: string;
}
