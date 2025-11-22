import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { Roles } from '../../common/decorators';
import { RoleGuard } from '../../common/guards';
import { Rol } from '../../database/entities/enums';

@ApiTags('email')
@ApiBearerAuth('JWT-auth')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email personalizado',
    description: `
**Requiere rol RRHH o ADMIN**

Envía un email personalizado con contenido HTML o texto plano.

**Configuración requerida:**
Asegúrate de tener configuradas las siguientes variables de entorno:
- \`MAIL_HOST\` - Servidor SMTP (ej: smtp.gmail.com)
- \`MAIL_PORT\` - Puerto SMTP (ej: 587)
- \`MAIL_USER\` - Usuario del correo
- \`MAIL_PASSWORD\` - Contraseña del correo
- \`MAIL_FROM_NAME\` - Nombre del remitente (opcional)
- \`MAIL_FROM_EMAIL\` - Email del remitente (opcional)

**Ejemplo con Gmail:**
1. Activa "Verificación en dos pasos" en tu cuenta de Gmail
2. Genera una "Contraseña de aplicación" en: https://myaccount.google.com/apppasswords
3. Usa esa contraseña en \`MAIL_PASSWORD\`

**Ejemplo de request:**
\`\`\`bash
curl -X POST http://localhost:3005/email/send \\
  -H "Authorization: Bearer tu-token-rrhh-o-admin" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "empleado@example.com",
    "subject": "Actualización de tu Incapacidad",
    "html": "<h1>Hola</h1><p>Tu incapacidad ha sido aprobada.</p>",
    "text": "Hola, tu incapacidad ha sido aprobada."
  }'
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado exitosamente',
    schema: {
      example: {
        success: true,
        messageId: '<abc123@smtp.gmail.com>',
        message: 'Email enviado exitosamente a: empleado@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error al enviar el email',
    schema: {
      example: {
        success: false,
        error: 'Invalid login: 535-5.7.8 Username and Password not accepted',
        message: 'Error al enviar el email. Verifica la configuración SMTP.',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async sendEmail(@Body() dto: SendEmailDto) {
    const result = await this.emailService.sendEmail(dto);

    if (result.success) {
      return {
        ...result,
        message: `Email enviado exitosamente a: ${Array.isArray(dto.to) ? dto.to.join(', ') : dto.to}`,
      };
    } else {
      return {
        ...result,
        message: 'Error al enviar el email. Verifica la configuración SMTP.',
      };
    }
  }

  @Post('test')
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email de prueba',
    description: `
**Solo ADMIN**

Envía un email de prueba para verificar que la configuración SMTP funciona correctamente.

**Ejemplo:**
\`\`\`bash
curl -X POST http://localhost:3005/email/test \\
  -H "Authorization: Bearer tu-token-admin" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "tu-email@example.com"
  }'
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Email de prueba enviado',
    schema: {
      example: {
        success: true,
        messageId: '<abc123@smtp.gmail.com>',
        message: 'Email de prueba enviado exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMIN',
  })
  async sendTestEmail(@Body('to') to: string) {
    const result = await this.emailService.sendEmail({
      to,
      subject: 'Email de Prueba - SIGI',
      html: `
        <h1>✅ Configuración SMTP Correcta</h1>
        <p>Este es un email de prueba del sistema SIGI.</p>
        <p>Si recibes este mensaje, significa que la configuración de correo está funcionando correctamente.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Email de prueba generado el ${new Date().toLocaleString()}</p>
      `,
      text: 'Email de prueba de SIGI. Si recibes este mensaje, la configuración SMTP funciona correctamente.',
    });

    return {
      ...result,
      message: result.success
        ? 'Email de prueba enviado exitosamente'
        : 'Error al enviar email de prueba. Revisa la configuración SMTP.',
    };
  }

  @Post('welcome')
  @UseGuards(RoleGuard)
  @Roles(Rol.RRHH, Rol.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email de bienvenida',
    description: 'Envía un email de bienvenida a un nuevo usuario registrado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de bienvenida enviado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol RRHH o ADMIN',
  })
  async sendWelcomeEmail(
    @Body('to') to: string,
    @Body('nombre') nombre: string,
    @Body('rol') rol: string,
  ) {
    const result = await this.emailService.sendWelcomeEmail(to, nombre, rol);

    return {
      ...result,
      message: result.success
        ? 'Email de bienvenida enviado exitosamente'
        : 'Error al enviar email de bienvenida',
    };
  }
}
