/**
 * ValidadorAutomatico: representa un servicio/herramienta de validación automática.
 * En Supabase, se puede mapear a una tabla `validadores_automaticos` para auditoría,
 * o simplemente implementarse como lógica en un servicio sin persistencia.
 * 
 * Por ahora, definimos una interfaz mínima para tracking de versiones.
 */
export interface ValidadorAutomatico {
  id: string; // UUID
  version: string; // Versión del validador (ej: "v1.0.0")
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Métodos (implementar en services):
 * - validateDocumento(doc: Documento): ValidationResult
 * - validateIncapacidad(inc: Incapacidad): ValidationResult
 */

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
