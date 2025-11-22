import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Destinatario(s) del email',
    example: 'usuario@example.com',
    oneOf: [
      { type: 'string', example: 'usuario@example.com' },
      { type: 'array', items: { type: 'string' }, example: ['usuario1@example.com', 'usuario2@example.com'] },
    ],
  })
  @IsNotEmpty()
  to: string | string[];

  @ApiProperty({
    description: 'Asunto del email',
    example: 'Notificación de Incapacidad',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Contenido del email en texto plano',
    example: 'Este es el contenido del email en texto plano.',
    required: false,
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Contenido del email en HTML',
    example: '<h1>Hola</h1><p>Este es el contenido del email en HTML.</p>',
    required: false,
  })
  @IsString()
  @IsOptional()
  html?: string;

  @ApiProperty({
    description: 'Copia (CC) del email',
    required: false,
    oneOf: [
      { type: 'string', example: 'cc@example.com' },
      { type: 'array', items: { type: 'string' }, example: ['cc1@example.com', 'cc2@example.com'] },
    ],
  })
  @IsOptional()
  cc?: string | string[];

  @ApiProperty({
    description: 'Copia oculta (BCC) del email',
    required: false,
    oneOf: [
      { type: 'string', example: 'bcc@example.com' },
      { type: 'array', items: { type: 'string' }, example: ['bcc1@example.com', 'bcc2@example.com'] },
    ],
  })
  @IsOptional()
  bcc?: string | string[];
}
