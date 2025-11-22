import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { mailConfig } from '../../config/mail.config';

export interface SendEmailDto {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.auth.user,
        pass: mailConfig.auth.pass,
      },
    });

    // Verificar la configuración al iniciar
    this.verifyConnection();
  }

  /**
   * Verifica la conexión con el servidor SMTP
   */
  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexión SMTP verificada exitosamente');
    } catch (error) {
      this.logger.error(
        `❌ Error verificando conexión SMTP: ${error.message}`,
      );
      this.logger.warn(
        '⚠️  El servicio de email NO está disponible. Configura las variables de entorno MAIL_*',
      );
    }
  }

  /**
   * Envía un email
   */
  async sendEmail(dto: SendEmailDto): Promise<EmailResult> {
    try {
      this.logger.log(`Enviando email a: ${Array.isArray(dto.to) ? dto.to.join(', ') : dto.to}`);

      const info = await this.transporter.sendMail({
        from: `"${mailConfig.from.name}" <${mailConfig.from.email}>`,
        to: Array.isArray(dto.to) ? dto.to.join(', ') : dto.to,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
        cc: dto.cc ? (Array.isArray(dto.cc) ? dto.cc.join(', ') : dto.cc) : undefined,
        bcc: dto.bcc ? (Array.isArray(dto.bcc) ? dto.bcc.join(', ') : dto.bcc) : undefined,
      });

      this.logger.log(`✅ Email enviado exitosamente. Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`❌ Error enviando email: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Envía un email de notificación de incapacidad registrada
   */
  async sendIncapacidadRegistrada(
    to: string,
    nombreEmpleado: string,
    numeroIncapacidad: string,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Incapacidad Registrada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${nombreEmpleado}</strong>,</p>
            <p>Tu incapacidad ha sido registrada exitosamente en el sistema SIGI.</p>
            
            <div class="info">
              <p><strong>📋 Número de Incapacidad:</strong> ${numeroIncapacidad}</p>
              <p><strong>📅 Fecha de Inicio:</strong> ${fechaInicio}</p>
              <p><strong>📅 Fecha de Fin:</strong> ${fechaFin}</p>
              <p><strong>✅ Estado:</strong> REGISTRADA</p>
            </div>
            
            <p>El equipo de Recursos Humanos revisará tu incapacidad y te notificaremos sobre cualquier actualización.</p>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático de SIGI - Sistema de Gestión de Incapacidades</p>
            <p>Por favor, no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Incapacidad Registrada - ${numeroIncapacidad}`,
      html,
      text: `Hola ${nombreEmpleado}, tu incapacidad ${numeroIncapacidad} ha sido registrada (${fechaInicio} - ${fechaFin}).`,
    });
  }

  /**
   * Envía un email de cambio de estado de incapacidad
   */
  async sendCambioEstadoIncapacidad(
    to: string,
    nombreEmpleado: string,
    numeroIncapacidad: string,
    nuevoEstado: string,
    observaciones?: string,
  ): Promise<EmailResult> {
    const estadoEmoji = {
      APROBADA: '✅',
      RECHAZADA: '❌',
      EN_REVISION: '🔍',
      CORRECCION: '⚠️',
      PAGADA: '💰',
    }[nuevoEstado] || '📝';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${estadoEmoji} Actualización de Incapacidad</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${nombreEmpleado}</strong>,</p>
            <p>El estado de tu incapacidad ha sido actualizado.</p>
            
            <div class="info">
              <p><strong>📋 Número de Incapacidad:</strong> ${numeroIncapacidad}</p>
              <p><strong>🔄 Nuevo Estado:</strong> ${nuevoEstado}</p>
              ${observaciones ? `<p><strong>💬 Observaciones:</strong> ${observaciones}</p>` : ''}
            </div>
            
            <p>Puedes revisar los detalles completos ingresando al sistema SIGI.</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático de SIGI - Sistema de Gestión de Incapacidades</p>
            <p>Por favor, no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Incapacidad ${nuevoEstado} - ${numeroIncapacidad}`,
      html,
      text: `Hola ${nombreEmpleado}, tu incapacidad ${numeroIncapacidad} ahora está en estado: ${nuevoEstado}${observaciones ? '. Observaciones: ' + observaciones : ''}.`,
    });
  }

  /**
   * Envía un email de bienvenida al registrarse
   */
  async sendWelcomeEmail(
    to: string,
    nombre: string,
    rol: string,
  ): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #673AB7; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #673AB7; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido a SIGI!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Tu cuenta ha sido creada exitosamente en el Sistema de Gestión de Incapacidades (SIGI).</p>
            
            <div class="info">
              <p><strong>👤 Tu Rol:</strong> ${rol}</p>
              <p><strong>📧 Email:</strong> ${to}</p>
            </div>
            
            <p>Ya puedes iniciar sesión y comenzar a usar el sistema.</p>
            
            <p>¡Gracias por ser parte de SIGI!</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático de SIGI - Sistema de Gestión de Incapacidades</p>
            <p>Por favor, no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '¡Bienvenido a SIGI!',
      html,
      text: `Hola ${nombre}, tu cuenta SIGI ha sido creada exitosamente. Tu rol es: ${rol}.`,
    });
  }
}
