import { EstadoIncapacidad } from './enums';

/**
 * Incapacidad: representa una incapacidad médica o licencia registrada.
 * En Supabase, se mapea a la tabla `incapacidades`.
 */
export interface Incapacidad {
  id: string; // UUID
  usuario_id: string; // FK a usuarios
  fecha_registro: Date;
  fecha_inicio: Date;
  fecha_fin: Date;
  motivo: string;
  monto_solicitado: number; // Decimal (almacenado como numeric en Postgres)
  estado: EstadoIncapacidad;
  observaciones?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos de negocio (implementar en services):
 * - duracion(): number (días)
 * - addDocumento(doc: Documento): void
 * - submit(): void
 * - cambiarEstado(nuevoEstado: EstadoIncapacidad): void
 */
