-- Migration: Make empresa_id required in usuarios table
-- Description: Convierte empresa_id en campo obligatorio (NOT NULL)
-- Date: 2025-11-22
-- IMPORTANTE: Ejecutar esta migración SOLO si todos los usuarios existentes tienen empresa_id asignado

-- Verificar que no existan usuarios sin empresa_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM usuarios WHERE empresa_id IS NULL) THEN
    RAISE EXCEPTION 'No se puede aplicar la migración: Existen usuarios sin empresa_id asignado. Por favor, asigna una empresa a todos los usuarios antes de continuar.';
  END IF;
END $$;

-- Convertir empresa_id en campo NOT NULL
ALTER TABLE usuarios
ALTER COLUMN empresa_id SET NOT NULL;

-- Comentario para documentación
COMMENT ON COLUMN usuarios.empresa_id IS 'ID de la empresa a la que pertenece el usuario (OBLIGATORIO)';
