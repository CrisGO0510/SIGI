import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitar recuperación de contraseña
 * Endpoint 1: POST /auth/recuperar-password/solicitar
 */
export class SolicitarRecuperacionDto {
  @ApiProperty({
    description: 'Email del usuario que solicita recuperar su contraseña',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;
}
