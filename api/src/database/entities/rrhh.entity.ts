/**
 * RRHH: extiende Usuario con rol RRHH (en el modelo relacional, simplemente un Usuario con rol='RRHH').
 * No necesita tabla separada, pero se puede crear un tipo/interfaz auxiliar para claridad en servicios.
 * 
 * En la práctica, RRHH es un Usuario con rol = Rol.RRHH.
 */
export interface RRHH {
  id: string; // UUID (mismo que usuario_id)
  nombre: string;
  email: string;
  // Hereda todos los campos de Usuario
}

/**
 * Métodos de negocio (implementar en services):
 * - revisarIncapacidad(inc: Incapacidad): void
 * - aprobarIncapacidad(inc: Incapacidad): void
 * - rechazarIncapacidad(inc: Incapacidad, motivo: string): void
 */
