import { TipoNotificacion } from './enums';

/**
 * Notificacion: representa una notificación enviada a usuarios o empresas.
 * En Supabase, se mapea a la tabla `notificaciones`.
 */
export interface Notificacion {
  id: string; // UUID
  tipo: TipoNotificacion;
  destinatario: string; // Email o teléfono según el tipo
  usuario_id?: string; // FK a usuarios (opcional, si va dirigido a usuario)
  empresa_id?: string; // FK a empresas (opcional)
  incapacidad_id?: string; // FK a incapacidades (origen de la notificación)
  asunto: string;
  cuerpo: string;
  fecha_envio?: Date;
  enviada: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos (implementar en services):
 * - send(): boolean
 */
