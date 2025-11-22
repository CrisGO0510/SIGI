import { EstadoPago } from './enums';

/**
 * Pago: representa el pago asociado a una incapacidad.
 * En Supabase, se mapea a la tabla `pagos`.
 */
export interface Pago {
  id: string; // UUID
  incapacidad_id: string; // FK a incapacidades
  usuario_id?: string; // FK a usuarios (receptor del pago)
  empresa_id?: string; // FK a empresas (quien realiza el pago)
  fecha_pago?: Date;
  monto: number; // Decimal
  estado_pago: EstadoPago;
  referencia?: string; // Referencia de transacción bancaria
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos (implementar en services):
 * - procesar(): boolean
 */
