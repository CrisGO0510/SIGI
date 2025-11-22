import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../../../database/entities/enums';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan@example.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema. Opciones: EMPLEADO (usuario regular), RRHH (recursos humanos), ADMIN (administrador)',
    enum: Rol,
    example: Rol.EMPLEADO,
    enumName: 'Rol',
  })
  @IsEnum(Rol, { message: 'El rol debe ser EMPLEADO, RRHH o ADMIN' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  rol: Rol;

  @ApiProperty({
    description: 'ID de la empresa a la que pertenece el usuario (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsNotEmpty({ message: 'El empresa_id es obligatorio' })
  @IsUUID('4', { message: 'El empresa_id debe ser un UUID válido' })
  empresa_id: string;
}
