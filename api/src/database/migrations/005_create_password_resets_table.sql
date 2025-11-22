-- Migration: 005_create_password_resets_table.sql
-- Description: Crea la tabla password_resets para el sistema de recuperación de contraseña
-- Author: Sistema SIGI
-- Date: 2025-11-22

-- =====================================================
-- Crear tabla password_resets
-- =====================================================

CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  codigo_verificacion VARCHAR(6) NOT NULL,
  token_hash VARCHAR(255),
  usado BOOLEAN DEFAULT FALSE NOT NULL,
  expira_en TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Crear índices para optimizar búsquedas
-- =====================================================

-- Índice para búsqueda por email
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- Índice para búsqueda por código de verificación
CREATE INDEX IF NOT EXISTS idx_password_resets_codigo ON password_resets(codigo_verificacion);

-- Índice para búsqueda por token hash
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);

-- Índice compuesto para búsquedas de resets activos por email
CREATE INDEX IF NOT EXISTS idx_password_resets_active_email 
  ON password_resets(email, usado, expira_en) 
  WHERE usado = FALSE;

-- Índice compuesto para búsquedas de resets activos por token
CREATE INDEX IF NOT EXISTS idx_password_resets_active_token 
  ON password_resets(token_hash, usado, expira_en) 
  WHERE usado = FALSE;

-- =====================================================
-- Comentarios para documentación
-- =====================================================

COMMENT ON TABLE password_resets IS 'Almacena códigos de verificación y tokens para recuperación de contraseña';

COMMENT ON COLUMN password_resets.id IS 'Identificador único del registro de reset';
COMMENT ON COLUMN password_resets.usuario_id IS 'Referencia al usuario (puede ser NULL si el email no existe, por seguridad)';
COMMENT ON COLUMN password_resets.email IS 'Email del usuario que solicita recuperación';
COMMENT ON COLUMN password_resets.codigo_verificacion IS 'Código de 6 dígitos enviado por email';
COMMENT ON COLUMN password_resets.token_hash IS 'Token hash especial generado tras validar el código';
COMMENT ON COLUMN password_resets.usado IS 'Indica si ya se usó para cambiar la contraseña';
COMMENT ON COLUMN password_resets.expira_en IS 'Timestamp de expiración (código válido por 15 minutos)';
COMMENT ON COLUMN password_resets.created_at IS 'Fecha y hora de creación del registro';

-- =====================================================
-- Función para limpiar resets expirados automáticamente
-- (Opcional: ejecutar periódicamente con un cron job)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS void AS $$
BEGIN
  DELETE FROM password_resets
  WHERE expira_en < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_password_resets() IS 'Elimina registros de password_resets expirados hace más de 24 horas';

-- =====================================================
-- Notas de uso
-- =====================================================

-- Para ejecutar la limpieza manual:
-- SELECT cleanup_expired_password_resets();

-- Para programar limpieza automática diaria (requiere pg_cron):
-- SELECT cron.schedule('cleanup-password-resets', '0 2 * * *', 'SELECT cleanup_expired_password_resets()');

-- =====================================================
-- Verificación
-- =====================================================

-- Verificar que la tabla fue creada correctamente:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'password_resets';
