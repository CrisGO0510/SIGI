/**
 * PasswordReset: almacena códigos de verificación y tokens para recuperación de contraseña
 * En Supabase, se mapea a la tabla `password_resets`.
 */
export interface PasswordReset {
  id: string; // UUID (generado por Supabase)
  usuario_id: string; // FK a tabla usuarios
  email: string; // Email del usuario (para búsqueda rápida)
  codigo_verificacion: string; // Código de 6 dígitos enviado por email
  token_hash: string | null; // Hash especial generado tras validar el código
  usado: boolean; // Si ya se usó para cambiar la contraseña
  expira_en: Date; // Timestamp de expiración (código válido por 15 minutos)
  created_at: Date;
}

/**
 * Script SQL para crear la tabla en Supabase:
 * 
 * CREATE TABLE password_resets (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
 *   email VARCHAR(255) NOT NULL,
 *   codigo_verificacion VARCHAR(6) NOT NULL,
 *   token_hash VARCHAR(255),
 *   usado BOOLEAN DEFAULT FALSE,
 *   expira_en TIMESTAMP NOT NULL,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_password_resets_email ON password_resets(email);
 * CREATE INDEX idx_password_resets_codigo ON password_resets(codigo_verificacion);
 * CREATE INDEX idx_password_resets_token ON password_resets(token_hash);
 */
