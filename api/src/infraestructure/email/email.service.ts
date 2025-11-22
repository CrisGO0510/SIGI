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

  /**
   * Genera URL de gráfico de pie para estados de incapacidades
   */
  private generatePieChartUrl(estadisticas: {
    aprobadas: number;
    rechazadas: number;
    pendientes: number;
  }): string {
    const chart = {
      type: 'pie',
      data: {
        labels: ['Aprobadas', 'Rechazadas', 'Pendientes'],
        datasets: [
          {
            data: [
              estadisticas.aprobadas,
              estadisticas.rechazadas,
              estadisticas.pendientes,
            ],
            backgroundColor: ['#4CAF50', '#f44336', '#FFC107'],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: 'Distribución por Estado',
            font: {
              size: 18,
              weight: 'bold',
            },
          },
        },
      },
    };

    const chartJson = encodeURIComponent(JSON.stringify(chart));
    return `https://quickchart.io/chart?width=500&height=300&c=${chartJson}`;
  }

  /**
   * Genera URL de gráfico de barras para incapacidades por mes
   */
  private generateBarChartUrl(incapacidades: Array<{ fechaInicio: string }>): string {
    // Agrupar incapacidades por mes
    const incapacidadesPorMes: { [key: string]: number } = {};
    
    incapacidades.forEach((inc) => {
      const fecha = inc.fechaInicio.split('/'); // formato: DD/MM/YYYY
      const mes = fecha[1]; // Obtener mes
      const año = fecha[2]; // Obtener año
      const mesAño = `${mes}/${año}`;
      
      incapacidadesPorMes[mesAño] = (incapacidadesPorMes[mesAño] || 0) + 1;
    });

    // Ordenar por fecha y obtener últimos 6 meses
    const mesesOrdenados = Object.keys(incapacidadesPorMes)
      .sort((a, b) => {
        const [mesA, añoA] = a.split('/').map(Number);
        const [mesB, añoB] = b.split('/').map(Number);
        return añoA === añoB ? mesA - mesB : añoA - añoB;
      })
      .slice(-6);

    const datos = mesesOrdenados.map((mes) => incapacidadesPorMes[mes]);

    const chart = {
      type: 'bar',
      data: {
        labels: mesesOrdenados,
        datasets: [
          {
            label: 'Incapacidades',
            data: datos,
            backgroundColor: '#667eea',
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Incapacidades por Mes',
            font: {
              size: 18,
              weight: 'bold',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    const chartJson = encodeURIComponent(JSON.stringify(chart));
    return `https://quickchart.io/chart?width=600&height=300&c=${chartJson}`;
  }

  /**
   * Genera URL de gráfico de línea para montos por mes
   */
  private generateLineChartUrl(
    incapacidades: Array<{ fechaInicio: string; monto?: number; estado: string }>
  ): string {
    // Agrupar montos aprobados por mes
    const montosPorMes: { [key: string]: number } = {};
    
    incapacidades
      .filter((inc) => inc.estado === 'APROBADA' && inc.monto)
      .forEach((inc) => {
        const fecha = inc.fechaInicio.split('/');
        const mes = fecha[1];
        const año = fecha[2];
        const mesAño = `${mes}/${año}`;
        
        montosPorMes[mesAño] = (montosPorMes[mesAño] || 0) + (inc.monto || 0);
      });

    const mesesOrdenados = Object.keys(montosPorMes)
      .sort((a, b) => {
        const [mesA, añoA] = a.split('/').map(Number);
        const [mesB, añoB] = b.split('/').map(Number);
        return añoA === añoB ? mesA - mesB : añoA - añoB;
      })
      .slice(-6);

    const datos = mesesOrdenados.map((mes) => montosPorMes[mes]);

    const chart = {
      type: 'line',
      data: {
        labels: mesesOrdenados,
        datasets: [
          {
            label: 'Monto Total (COP)',
            data: datos,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Montos Aprobados por Mes',
            font: {
              size: 18,
              weight: 'bold',
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + value.toLocaleString('es-CO');
              },
            },
          },
        },
      },
    };

    const chartJson = encodeURIComponent(JSON.stringify(chart));
    return `https://quickchart.io/chart?width=600&height=300&c=${chartJson}`;
  }

  /**
   * Envía reporte de incapacidades de empleados a la empresa
   */
  async sendReporteEmpresa(
    emailEmpresa: string,
    nombreEmpresa: string,
    periodo: { inicio: string; fin: string },
    incapacidades: Array<{
      empleado: string;
      motivo: string;
      fechaInicio: string;
      fechaFin: string;
      dias: number;
      estado: string;
      monto?: number;
      documentoUrl?: string;
    }>,
    estadisticas: {
      total: number;
      aprobadas: number;
      rechazadas: number;
      pendientes: number;
      montoTotal: number;
    },
  ): Promise<EmailResult> {
    // Generar tabla HTML con las incapacidades
    const filasIncapacidades = incapacidades
      .map(
        (inc) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.empleado}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.motivo}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.fechaInicio}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.fechaFin}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${inc.dias}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
              ${inc.estado === 'APROBADA' ? 'background-color: #4CAF50; color: white;' : 
                inc.estado === 'RECHAZADA' ? 'background-color: #f44336; color: white;' : 
                'background-color: #FFC107; color: black;'}">
              ${inc.estado}
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
            ${inc.monto ? '$' + inc.monto.toLocaleString('es-PA') : 'N/A'}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
            ${inc.documentoUrl 
              ? `<a href="${inc.documentoUrl}" target="_blank" style="color: #667eea; text-decoration: none; font-weight: bold;">📄 Ver</a>` 
              : '<span style="color: #999;">Sin documento</span>'}
          </td>
        </tr>
      `,
      )
      .join('');

    // Generar URLs de gráficos
    const pieChartUrl = this.generatePieChartUrl(estadisticas);
    const barChartUrl = this.generateBarChartUrl(incapacidades);
    const lineChartUrl = this.generateLineChartUrl(incapacidades);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 900px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
          .stat-number { font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .stat-label { color: #666; font-size: 14px; text-transform: uppercase; }
          .table-container { overflow-x: auto; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          th { background-color: #667eea; color: white; padding: 12px; text-align: left; font-weight: bold; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #e9ecef; border-radius: 0 0 10px 10px; }
          .period { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .charts-section { margin: 30px 0; }
          .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; text-align: center; }
          .chart-container img { max-width: 100%; height: auto; border-radius: 8px; }
          .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Reporte de Incapacidades</h1>
            <h2>${nombreEmpresa}</h2>
          </div>
          
          <div class="content">
            <div class="period">
              <strong>📅 Período del Reporte:</strong> ${periodo.inicio} al ${periodo.fin}
            </div>

            <h3 style="color: #667eea; margin-top: 30px;">📈 Resumen Estadístico</h3>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Total Incapacidades</div>
                <div class="stat-number">${estadisticas.total}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Aprobadas</div>
                <div class="stat-number" style="color: #4CAF50;">${estadisticas.aprobadas}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Rechazadas</div>
                <div class="stat-number" style="color: #f44336;">${estadisticas.rechazadas}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Pendientes</div>
                <div class="stat-number" style="color: #FFC107;">${estadisticas.pendientes}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Monto Total</div>
                <div class="stat-number" style="font-size: 24px;">$${estadisticas.montoTotal.toLocaleString('es-PA')}</div>
              </div>
            </div>

            ${incapacidades.length > 0 ? `
            <div class="charts-section">
              <h3 style="color: #667eea; margin-top: 30px;">📊 Gráficos Estadísticos</h3>
              
              <div class="chart-container">
                <img src="${pieChartUrl}" alt="Distribución por Estado" />
              </div>

              <div class="charts-grid">
                <div class="chart-container">
                  <img src="${barChartUrl}" alt="Incapacidades por Mes" />
                </div>
                <div class="chart-container">
                  <img src="${lineChartUrl}" alt="Montos Aprobados por Mes" />
                </div>
              </div>
            </div>
            ` : ''}

            <h3 style="color: #667eea; margin-top: 30px;">📋 Detalle de Incapacidades</h3>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Motivo</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th style="text-align: center;">Días</th>
                    <th>Estado</th>
                    <th style="text-align: right;">Monto</th>
                    <th style="text-align: center;">Documento</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasIncapacidades}
                </tbody>
              </table>
            </div>

            ${incapacidades.length === 0 ? '<p style="text-align: center; padding: 30px; color: #666;">No se encontraron incapacidades en el período seleccionado.</p>' : ''}
          </div>
          
          <div class="footer">
            <p><strong>SIGI - Sistema de Gestión de Incapacidades</strong></p>
            <p>Este es un correo automático generado el ${new Date().toLocaleString('es-PA')}</p>
            <p>Por favor, no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textoPlano = `
Reporte de Incapacidades - ${nombreEmpresa}
Período: ${periodo.inicio} al ${periodo.fin}

RESUMEN:
- Total: ${estadisticas.total}
- Aprobadas: ${estadisticas.aprobadas}
- Rechazadas: ${estadisticas.rechazadas}
- Pendientes: ${estadisticas.pendientes}
- Monto Total: $${estadisticas.montoTotal.toLocaleString('es-PA')}

DETALLE:
${incapacidades.map((inc) => `- ${inc.empleado}: ${inc.motivo} (${inc.fechaInicio} - ${inc.fechaFin}) - ${inc.estado}`).join('\n')}
    `;

    return this.sendEmail({
      to: emailEmpresa,
      subject: `Reporte de Incapacidades - ${nombreEmpresa} (${periodo.inicio} al ${periodo.fin})`,
      html,
      text: textoPlano,
    });
  }
}
