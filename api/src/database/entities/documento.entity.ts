import { FormatoReporte } from './enums';

/**
 * Documento: representa un archivo adjunto a una incapacidad.
 * En Supabase, se mapea a la tabla `documentos` y almacenamiento en Supabase Storage.
 */
export interface Documento {
  id: string; // UUID
  incapacidad_id: string; // FK a incapacidades
  nombre_archivo: string;
  formato: FormatoReporte;
  tamano_bytes: number;
  hash?: string; // Hash SHA256 o similar para verificación de integridad
  fecha_subida: Date;
  validado: boolean;
  detalle_validacion?: string;
  storage_path?: string; // Ruta en Supabase Storage
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos (implementar en services):
 * - validateDocumento(): ValidationResult
 */
