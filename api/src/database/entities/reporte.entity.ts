import { FormatoReporte } from './enums';

/**
 * Reporte: representa un reporte generado (CSV o PDF) para GestionHumana, Contabilidad, Auditoria.
 * En Supabase, se mapea a la tabla `reportes`.
 */
export interface Reporte {
  id: string; // UUID
  formato: FormatoReporte;
  destinatario: string; // "GestionHumana" | "Contabilidad" | "Auditoria"
  empresa_id?: string; // FK a empresas (quien recibe el reporte)
  fecha_generacion: Date;
  ubicacion_archivo?: string; // Path en Supabase Storage o URL
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos (implementar en services):
 * - generate(datos): void
 * - sendByEmail(emailDestino): void
 */
