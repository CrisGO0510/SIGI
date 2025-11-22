-- Migration: Add empresa_id to usuarios table
-- Description: Establece la relación entre usuarios y empresas
-- Date: 2025-11-22

-- Agregar columna empresa_id a la tabla usuarios
ALTER TABLE usuarios
ADD COLUMN empresa_id UUID;

-- Agregar foreign key constraint
ALTER TABLE usuarios
ADD CONSTRAINT fk_usuarios_empresa
FOREIGN KEY (empresa_id)
REFERENCES empresas(id)
ON DELETE SET NULL;

-- Crear índice para mejorar performance en búsquedas por empresa
CREATE INDEX idx_usuarios_empresa_id ON usuarios(empresa_id);

-- Comentarios para documentación
COMMENT ON COLUMN usuarios.empresa_id IS 'ID de la empresa a la que pertenece el usuario';
