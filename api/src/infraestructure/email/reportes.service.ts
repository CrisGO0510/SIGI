import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface ReporteData {
  empresa: {
    nombre: string;
    correo: string;
  };
  periodo: {
    inicio: string;
    fin: string;
  };
  estadisticas: {
    total: number;
    aprobadas: number;
    rechazadas: number;
    pendientes: number;
    montoTotal: number;
  };
  incapacidades: Array<{
    empleado: string;
    motivo: string;
    fechaInicio: string;
    fechaFin: string;
    dias: number;
    estado: string;
    monto: number;
    documentoUrl?: string;
  }>;
}

@Injectable()
export class ReportesService {
  /**
   * Genera un reporte en formato PDF
   */
  async generarReportePDF(data: ReporteData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        // Capturar los chunks del stream
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // --- HEADER ---
        doc
          .fontSize(24)
          .fillColor('#667eea')
          .text('Reporte de Incapacidades', { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(18)
          .fillColor('#333')
          .text(data.empresa.nombre, { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(12)
          .fillColor('#666')
          .text(`Período: ${data.periodo.inicio} al ${data.periodo.fin}`, {
            align: 'center',
          })
          .moveDown(1);

        // Línea separadora
        doc
          .strokeColor('#667eea')
          .lineWidth(2)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke()
          .moveDown(1);

        // --- ESTADÍSTICAS ---
        doc
          .fontSize(16)
          .fillColor('#667eea')
          .text('Resumen Estadístico', { underline: true })
          .moveDown(0.5);

        const startY = doc.y;
        const boxWidth = 110;
        const boxHeight = 80;
        const gap = 15;

        // Función para dibujar una caja de estadística
        const drawStatBox = (
          x: number,
          y: number,
          label: string,
          value: string,
          color: string,
        ) => {
          doc
            .rect(x, y, boxWidth, boxHeight)
            .fillAndStroke(color, '#ddd')
            .fillColor('#fff')
            .fontSize(10)
            .text(label, x + 5, y + 10, {
              width: boxWidth - 10,
              align: 'center',
            });

          doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text(value, x + 5, y + 35, {
              width: boxWidth - 10,
              align: 'center',
            });

          doc.font('Helvetica'); // Reset font
        };

        // Dibujar cajas de estadísticas (4 por fila)
        drawStatBox(50, startY, 'Total', `${data.estadisticas.total}`, '#667eea');
        drawStatBox(
          50 + boxWidth + gap,
          startY,
          'Aprobadas',
          `${data.estadisticas.aprobadas}`,
          '#4CAF50',
        );
        drawStatBox(
          50 + (boxWidth + gap) * 2,
          startY,
          'Rechazadas',
          `${data.estadisticas.rechazadas}`,
          '#f44336',
        );
        drawStatBox(
          50 + (boxWidth + gap) * 3,
          startY,
          'Pendientes',
          `${data.estadisticas.pendientes}`,
          '#FFC107',
        );

        // Segunda fila con monto total
        const secondRowY = startY + boxHeight + gap;
        doc
          .rect(50, secondRowY, boxWidth * 2 + gap, boxHeight)
          .fillAndStroke('#4CAF50', '#ddd')
          .fillColor('#fff')
          .fontSize(10)
          .text('Monto Total Aprobado', 50 + 5, secondRowY + 10, {
            width: boxWidth * 2 + gap - 10,
            align: 'center',
          });

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(
            `$${data.estadisticas.montoTotal.toLocaleString('es-CO')} COP`,
            50 + 5,
            secondRowY + 35,
            {
              width: boxWidth * 2 + gap - 10,
              align: 'center',
            },
          );

        doc.font('Helvetica'); // Reset font
        doc.y = secondRowY + boxHeight + 30;

        // --- TABLA DE INCAPACIDADES ---
        doc
          .fillColor('#667eea')
          .fontSize(16)
          .text('Detalle de Incapacidades', { underline: true })
          .moveDown(0.5);

        if (data.incapacidades.length === 0) {
          doc
            .fillColor('#999')
            .fontSize(12)
            .text('No se encontraron incapacidades en el período seleccionado.', {
              align: 'center',
            });
        } else {
          // Encabezados de tabla
          const tableTop = doc.y;
          const colWidths = [100, 80, 70, 70, 40, 70, 65];
          const headers = [
            'Empleado',
            'Motivo',
            'Inicio',
            'Fin',
            'Días',
            'Estado',
            'Monto',
          ];

          doc.fillColor('#667eea').fontSize(9).font('Helvetica-Bold');

          let xPos = 50;
          headers.forEach((header, i) => {
            doc.text(header, xPos, tableTop, {
              width: colWidths[i],
              align: 'left',
            });
            xPos += colWidths[i];
          });

          doc.font('Helvetica'); // Reset font
          doc
            .strokeColor('#667eea')
            .lineWidth(1)
            .moveTo(50, tableTop + 15)
            .lineTo(545, tableTop + 15)
            .stroke();

          // Filas de datos
          let yPos = tableTop + 25;
          const rowHeight = 30;

          data.incapacidades.forEach((inc, index) => {
            // Verificar si necesitamos una nueva página
            if (yPos > 700) {
              doc.addPage();
              yPos = 50;

              // Re-dibujar encabezados en la nueva página
              doc.fillColor('#667eea').fontSize(9).font('Helvetica-Bold');
              xPos = 50;
              headers.forEach((header, i) => {
                doc.text(header, xPos, yPos, {
                  width: colWidths[i],
                  align: 'left',
                });
                xPos += colWidths[i];
              });
              doc.font('Helvetica');
              doc
                .strokeColor('#667eea')
                .lineWidth(1)
                .moveTo(50, yPos + 15)
                .lineTo(545, yPos + 15)
                .stroke();
              yPos += 25;
            }

            doc.fillColor('#333').fontSize(8);

            xPos = 50;
            const values = [
              inc.empleado,
              inc.motivo.substring(0, 15) + (inc.motivo.length > 15 ? '...' : ''),
              inc.fechaInicio,
              inc.fechaFin,
              `${inc.dias}`,
              inc.estado,
              `$${inc.monto.toLocaleString('es-CO')}`,
            ];

            values.forEach((value, i) => {
              doc.text(value, xPos, yPos, {
                width: colWidths[i],
                align: i === 4 || i === 6 ? 'center' : 'left',
              });
              xPos += colWidths[i];
            });

            // Línea separadora
            doc
              .strokeColor('#ddd')
              .lineWidth(0.5)
              .moveTo(50, yPos + rowHeight - 5)
              .lineTo(545, yPos + rowHeight - 5)
              .stroke();

            yPos += rowHeight;
          });
        }

        // --- FOOTER ---
        const pageCount = (doc as any).bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc
            .fontSize(8)
            .fillColor('#999')
            .text(
              `Generado el ${new Date().toLocaleString('es-CO')} | Página ${i + 1} de ${pageCount}`,
              50,
              750,
              { align: 'center' },
            );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un reporte en formato CSV
   */
  generarReporteCSV(data: ReporteData): string {
    const lines: string[] = [];

    // Header con información de la empresa y período
    lines.push(`Reporte de Incapacidades`);
    lines.push(`Empresa,${this.escapeCsvValue(data.empresa.nombre)}`);
    lines.push(
      `Período,${data.periodo.inicio} al ${data.periodo.fin}`,
    );
    lines.push(''); // Línea vacía

    // Estadísticas
    lines.push('RESUMEN ESTADÍSTICO');
    lines.push(`Total Incapacidades,${data.estadisticas.total}`);
    lines.push(`Aprobadas,${data.estadisticas.aprobadas}`);
    lines.push(`Rechazadas,${data.estadisticas.rechazadas}`);
    lines.push(`Pendientes,${data.estadisticas.pendientes}`);
    lines.push(
      `Monto Total Aprobado,$${data.estadisticas.montoTotal.toLocaleString('es-CO')} COP`,
    );
    lines.push(''); // Línea vacía

    // Encabezados de la tabla
    lines.push(
      'DETALLE DE INCAPACIDADES',
    );
    lines.push(
      'Empleado,Motivo,Fecha Inicio,Fecha Fin,Días,Estado,Monto,URL Documento',
    );

    // Datos
    if (data.incapacidades.length === 0) {
      lines.push('Sin incapacidades en el período seleccionado');
    } else {
      data.incapacidades.forEach((inc) => {
        lines.push(
          [
            this.escapeCsvValue(inc.empleado),
            this.escapeCsvValue(inc.motivo),
            inc.fechaInicio,
            inc.fechaFin,
            inc.dias,
            inc.estado,
            `$${inc.monto.toLocaleString('es-CO')}`,
            inc.documentoUrl || 'Sin documento',
          ].join(','),
        );
      });
    }

    return lines.join('\n');
  }

  /**
   * Escapa valores para CSV (maneja comillas y comas)
   */
  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
