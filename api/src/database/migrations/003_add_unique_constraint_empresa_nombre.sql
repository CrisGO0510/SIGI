-- Migration: Add unique constraint to empresas.nombre
-- Description: Asegura que no puedan existir dos empresas con el mismo nombre
-- Date: 2025-11-22

-- Primero, eliminar duplicados si existen (esto es preventivo)
-- Mantiene el registro más antiguo y elimina los duplicados
DELETE FROM empresas a
USING empresas b
WHERE a.id > b.id
AND a.nombre = b.nombre;

-- Agregar constraint de unicidad al campo nombre
ALTER TABLE empresas
ADD CONSTRAINT uq_empresas_nombre UNIQUE (nombre);

-- Crear índice único para mejorar performance en búsquedas por nombre
-- (Nota: UNIQUE constraint ya crea un índice automáticamente, pero lo declaramos explícitamente)
CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_nombre_unique ON empresas(nombre);

-- Comentario para documentación
COMMENT ON CONSTRAINT uq_empresas_nombre ON empresas IS 'Garantiza que cada empresa tenga un nombre único en el sistema';
