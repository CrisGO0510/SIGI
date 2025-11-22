-- =====================================================
-- MIGRACIÓN INICIAL SIGI - Sistema de Gestión de Incapacidades
-- Base de datos: PostgreSQL (Supabase)
-- Fecha: 2025-11-21
-- =====================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TIPOS ENUM
-- =====================================================

CREATE TYPE rol AS ENUM ('EMPLEADO', 'RRHH', 'ADMIN');

CREATE TYPE estado_incapacidad AS ENUM (
  'REGISTRADA',
  'VALIDANDO',
  'CORRECCION',
  'PENDIENTE_REVISION',
  'EN_REVISION',
  'APROBADA',
  'RECHAZADA',
  'ESPERANDO_PAGO',
  'PAGADA',
  'CERRADA'
);

CREATE TYPE formato_reporte AS ENUM ('CSV', 'PDF');

CREATE TYPE estado_pago AS ENUM ('PENDIENTE', 'COMPLETADO', 'FALLIDO');

CREATE TYPE tipo_notificacion AS ENUM ('EMAIL', 'SMS');

-- =====================================================
-- TABLA: empresas
-- =====================================================
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  correo_contacto VARCHAR(255) NOT NULL,
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE empresas IS 'Organizaciones/empresas que usan el sistema';

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_encrypted VARCHAR(255) NOT NULL,
  rol rol NOT NULL DEFAULT 'EMPLEADO',
  telefono VARCHAR(50),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE usuarios IS 'Usuarios del sistema: empleados, RRHH y administradores';

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =====================================================
-- TABLA: incapacidades
-- =====================================================
CREATE TABLE incapacidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  motivo TEXT NOT NULL,
  monto_solicitado NUMERIC(12, 2) NOT NULL,
  estado estado_incapacidad NOT NULL DEFAULT 'REGISTRADA',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_fechas CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT chk_monto_positivo CHECK (monto_solicitado >= 0)
);

COMMENT ON TABLE incapacidades IS 'Incapacidades médicas y licencias registradas';

CREATE INDEX idx_incapacidades_usuario ON incapacidades(usuario_id);
CREATE INDEX idx_incapacidades_estado ON incapacidades(estado);
CREATE INDEX idx_incapacidades_fechas ON incapacidades(fecha_inicio, fecha_fin);

-- =====================================================
-- TABLA: documentos
-- =====================================================
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incapacidad_id UUID NOT NULL REFERENCES incapacidades(id) ON DELETE CASCADE,
  nombre_archivo VARCHAR(255) NOT NULL,
  formato formato_reporte NOT NULL,
  tamano_bytes BIGINT NOT NULL,
  hash VARCHAR(64),
  fecha_subida TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validado BOOLEAN NOT NULL DEFAULT FALSE,
  detalle_validacion TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_tamano_positivo CHECK (tamano_bytes > 0)
);

COMMENT ON TABLE documentos IS 'Documentos adjuntos a incapacidades';

CREATE INDEX idx_documentos_incapacidad ON documentos(incapacidad_id);
CREATE INDEX idx_documentos_validado ON documentos(validado);

-- =====================================================
-- TABLA: pagos
-- =====================================================
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incapacidad_id UUID NOT NULL REFERENCES incapacidades(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  fecha_pago TIMESTAMPTZ,
  monto NUMERIC(12, 2) NOT NULL,
  estado_pago estado_pago NOT NULL DEFAULT 'PENDIENTE',
  referencia VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_monto_pago_positivo CHECK (monto >= 0)
);

COMMENT ON TABLE pagos IS 'Pagos asociados a incapacidades';

CREATE INDEX idx_pagos_incapacidad ON pagos(incapacidad_id);
CREATE INDEX idx_pagos_estado ON pagos(estado_pago);
CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);

-- =====================================================
-- TABLA: notificaciones
-- =====================================================
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo tipo_notificacion NOT NULL,
  destinatario VARCHAR(255) NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  incapacidad_id UUID REFERENCES incapacidades(id) ON DELETE SET NULL,
  asunto VARCHAR(500) NOT NULL,
  cuerpo TEXT NOT NULL,
  fecha_envio TIMESTAMPTZ,
  enviada BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE notificaciones IS 'Notificaciones enviadas por email o SMS';

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_incapacidad ON notificaciones(incapacidad_id);
CREATE INDEX idx_notificaciones_enviada ON notificaciones(enviada);

-- =====================================================
-- TABLA: reportes
-- =====================================================
CREATE TABLE reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formato formato_reporte NOT NULL,
  destinatario VARCHAR(100) NOT NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ubicacion_archivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE reportes IS 'Reportes generados (CSV/PDF) para gestión humana, contabilidad y auditoría';

CREATE INDEX idx_reportes_empresa ON reportes(empresa_id);
CREATE INDEX idx_reportes_fecha ON reportes(fecha_generacion);

-- =====================================================
-- TABLA: estadisticas
-- =====================================================
CREATE TABLE estadisticas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_incapacidades INT NOT NULL DEFAULT 0,
  total_pendiente_pago NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tiempo_promedio_aprobacion NUMERIC(10, 2) DEFAULT 0,
  ubicacion_grafico TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_estadisticas_fechas CHECK (end_date >= start_date)
);

COMMENT ON TABLE estadisticas IS 'Estadísticas calculadas sobre incapacidades en un período';

CREATE INDEX idx_estadisticas_fechas ON estadisticas(start_date, end_date);

-- =====================================================
-- TABLA: validadores_automaticos
-- =====================================================
CREATE TABLE validadores_automaticos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE validadores_automaticos IS 'Registro de versiones de validadores automáticos';

-- =====================================================
-- TABLA AUXILIAR: reporte_incapacidades (relación muchos a muchos)
-- =====================================================
CREATE TABLE reporte_incapacidades (
  reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
  incapacidad_id UUID NOT NULL REFERENCES incapacidades(id) ON DELETE CASCADE,
  PRIMARY KEY (reporte_id, incapacidad_id)
);

COMMENT ON TABLE reporte_incapacidades IS 'Relación muchos a muchos entre reportes e incapacidades';

CREATE INDEX idx_reporte_incapacidades_reporte ON reporte_incapacidades(reporte_id);
CREATE INDEX idx_reporte_incapacidades_incapacidad ON reporte_incapacidades(incapacidad_id);

-- =====================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: actualizar updated_at en todas las tablas
-- =====================================================
CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_incapacidades_updated_at
  BEFORE UPDATE ON incapacidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pagos_updated_at
  BEFORE UPDATE ON pagos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notificaciones_updated_at
  BEFORE UPDATE ON notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reportes_updated_at
  BEFORE UPDATE ON reportes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_estadisticas_updated_at
  BEFORE UPDATE ON estadisticas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_validadores_automaticos_updated_at
  BEFORE UPDATE ON validadores_automaticos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Políticas básicas
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE incapacidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estadisticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE validadores_automaticos ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: los usuarios pueden ver su propia información
CREATE POLICY usuarios_select_own
  ON usuarios FOR SELECT
  USING (auth.uid()::text = id::text);

-- Política para usuarios: RRHH y ADMIN pueden ver todos los usuarios
CREATE POLICY usuarios_select_admin_rrhh
  ON usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id::text = auth.uid()::text
      AND u.rol IN ('RRHH', 'ADMIN')
    )
  );

-- Política para incapacidades: los empleados pueden ver sus propias incapacidades
CREATE POLICY incapacidades_select_own
  ON incapacidades FOR SELECT
  USING (usuario_id::text = auth.uid()::text);

-- Política para incapacidades: RRHH y ADMIN pueden ver todas las incapacidades
CREATE POLICY incapacidades_select_admin_rrhh
  ON incapacidades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id::text = auth.uid()::text
      AND u.rol IN ('RRHH', 'ADMIN')
    )
  );

-- Política para incapacidades: los empleados pueden crear sus propias incapacidades
CREATE POLICY incapacidades_insert_own
  ON incapacidades FOR INSERT
  WITH CHECK (usuario_id::text = auth.uid()::text);

-- Política para incapacidades: RRHH y ADMIN pueden actualizar cualquier incapacidad
CREATE POLICY incapacidades_update_admin_rrhh
  ON incapacidades FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id::text = auth.uid()::text
      AND u.rol IN ('RRHH', 'ADMIN')
    )
  );

-- Política para documentos: acceso basado en la incapacidad asociada
CREATE POLICY documentos_select_via_incapacidad
  ON documentos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM incapacidades i
      WHERE i.id = documentos.incapacidad_id
      AND (
        i.usuario_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM usuarios u
          WHERE u.id::text = auth.uid()::text
          AND u.rol IN ('RRHH', 'ADMIN')
        )
      )
    )
  );

-- Política para pagos: solo ADMIN y RRHH pueden ver pagos
CREATE POLICY pagos_select_admin_rrhh
  ON pagos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id::text = auth.uid()::text
      AND u.rol IN ('RRHH', 'ADMIN')
    )
  );

-- Política para notificaciones: los usuarios pueden ver sus propias notificaciones
CREATE POLICY notificaciones_select_own
  ON notificaciones FOR SELECT
  USING (usuario_id::text = auth.uid()::text);

-- Política para reportes: solo ADMIN y RRHH pueden ver reportes
CREATE POLICY reportes_select_admin_rrhh
  ON reportes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id::text = auth.uid()::text
      AND u.rol IN ('RRHH', 'ADMIN')
    )
  );

-- Política para estadísticas: solo ADMIN y RRHH pueden ver estadísticas
CREATE POLICY estadisticas_select_admin_rrhh
  ON estadisticas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id::text = auth.uid()::text
      AND u.rol IN ('RRHH', 'ADMIN')
    )
  );

-- =====================================================
-- DATOS INICIALES (SEEDS)
-- =====================================================

-- Insertar empresa por defecto
INSERT INTO empresas (id, nombre, correo_contacto, direccion)
VALUES (
  uuid_generate_v4(),
  'Empresa Demo SIGI',
  'contacto@empresa-demo.com',
  'Calle Principal #123'
);

-- Insertar usuario ADMIN por defecto (password: "admin123" - hash bcrypt)
-- NOTA: Cambiar el password en producción
INSERT INTO usuarios (id, nombre, email, password_encrypted, rol)
VALUES (
  uuid_generate_v4(),
  'Administrador Sistema',
  'admin@sigi.com',
  '$2a$10$rM8zJQXkVQZvWvVYvXvVveZvVxVwVuVtVrVpVnVlVkVjViVhVgVfVe', -- placeholder
  'ADMIN'
);

-- Insertar usuario RRHH por defecto
INSERT INTO usuarios (id, nombre, email, password_encrypted, rol)
VALUES (
  uuid_generate_v4(),
  'Personal RRHH',
  'rrhh@sigi.com',
  '$2a$10$rM8zJQXkVQZvWvVYvXvVveZvVxVwVuVtVrVpVnVlVkVjViVhVgVfVe', -- placeholder
  'RRHH'
);

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

COMMENT ON SCHEMA public IS 'Schema principal del sistema SIGI - Sistema de Gestión de Incapacidades';
