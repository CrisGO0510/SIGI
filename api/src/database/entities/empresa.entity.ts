/**
 * Empresa: representa una organización/empresa que recibe reportes y notificaciones.
 * En Supabase, se mapea a la tabla `empresas`.
 */
export interface Empresa {
  id: string; // UUID
  nombre: string;
  correo_contacto: string;
  direccion?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos (implementar en services):
 * - receiveNotification(notif: Notificacion): void
 */
