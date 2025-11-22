import { Rol } from './enums';

/**
 * Usuario: representa tanto empleados como personal de RRHH y administradores.
 * En Supabase, se mapea a la tabla `usuarios`.
 */
export interface Usuario {
  id: string; // UUID (generado por Supabase)
  nombre: string;
  email: string;
  password_encrypted: string;
  rol: Rol;
  telefono?: string;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos de negocio para Usuario (se implementarán en services)
 * - login(password): boolean
 * - requestPasswordReset(): void
 * - resetPassword(token, newPassword): boolean
 * - consultarIncapacidades(): List<Incapacidad>
 * - consultarEstadisticas(): Estadistica
 */
