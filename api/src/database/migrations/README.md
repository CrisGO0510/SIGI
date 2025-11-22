# Migración de Base de Datos SIGI

Este directorio contiene los scripts SQL para crear y actualizar el esquema de la base de datos en Supabase.

## Aplicar Migración Inicial

### Opción 1: Usando el SQL Editor de Supabase (Recomendado)

1. Inicia sesión en tu proyecto de Supabase: https://supabase.com/dashboard
2. Ve a la sección **SQL Editor**
3. Copia y pega el contenido de `001_initial_schema.sql`
4. Ejecuta el script (botón "RUN" o Ctrl+Enter)

### Opción 2: Usando Supabase CLI

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login en Supabase
supabase login

# Vincular tu proyecto local con el proyecto remoto
supabase link --project-ref <tu-project-ref>

# Aplicar la migración
supabase db push
```

### Opción 3: Usando psql (PostgreSQL CLI)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f src/database/migrations/001_initial_schema.sql
```

## Contenido de la Migración Inicial

La migración `001_initial_schema.sql` incluye:

### ✅ Tipos ENUM
- `rol`: EMPLEADO, RRHH, ADMIN
- `estado_incapacidad`: 10 estados del flujo de incapacidades
- `formato_reporte`: CSV, PDF
- `estado_pago`: PENDIENTE, COMPLETADO, FALLIDO
- `tipo_notificacion`: EMAIL, SMS

### ✅ Tablas Creadas
1. **empresas** - Organizaciones que usan el sistema
2. **usuarios** - Empleados, RRHH y administradores
3. **incapacidades** - Incapacidades médicas y licencias
4. **documentos** - Archivos adjuntos a incapacidades
5. **pagos** - Pagos asociados a incapacidades
6. **notificaciones** - Notificaciones por email/SMS
7. **reportes** - Reportes CSV/PDF generados
8. **estadisticas** - Estadísticas calculadas
9. **validadores_automaticos** - Registro de validadores
10. **reporte_incapacidades** - Relación muchos a muchos

### ✅ Constraints e Índices
- Primary keys (UUID)
- Foreign keys con ON DELETE apropiado
- Check constraints para validación de datos
- Índices en campos frecuentemente consultados

### ✅ Triggers
- Actualización automática de `updated_at` en todas las tablas

### ✅ Row Level Security (RLS)
- Políticas básicas de acceso por rol
- Empleados: ven sus propias incapacidades
- RRHH/ADMIN: acceso completo
- Protección de datos sensibles (pagos, reportes)

### ✅ Datos Iniciales (Seeds)
- Empresa demo
- Usuario ADMIN (email: `admin@sigi.com`, password placeholder)
- Usuario RRHH (email: `rrhh@sigi.com`, password placeholder)

## ⚠️ IMPORTANTE: Cambiar Passwords

Los usuarios iniciales tienen passwords de ejemplo. **Debes actualizarlos** antes de usar en producción:

```sql
-- Generar un hash bcrypt real para tus passwords
UPDATE usuarios 
SET password_encrypted = '<tu-hash-bcrypt-aquí>' 
WHERE email IN ('admin@sigi.com', 'rrhh@sigi.com');
```

Puedes generar un hash bcrypt usando Node.js:

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('tu-password-seguro', 10);
console.log(hash);
```

## Verificar Migración

Después de aplicar la migración, verifica que se crearon todas las tablas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deberías ver:
- documentos
- empresas
- estadisticas
- incapacidades
- notificaciones
- pagos
- reporte_incapacidades
- reportes
- usuarios
- validadores_automaticos

## Próximos Pasos

1. ✅ Aplicar la migración en Supabase
2. 🔧 Actualizar passwords de usuarios iniciales
3. 🔐 Configurar autenticación de Supabase (auth.users)
4. 📝 Crear repositorios en NestJS para acceder a las tablas
5. 🧪 Implementar seeds adicionales para datos de prueba

## Rollback

Si necesitas revertir la migración:

```sql
-- CUIDADO: Esto eliminará TODAS las tablas y datos
DROP TABLE IF EXISTS reporte_incapacidades CASCADE;
DROP TABLE IF EXISTS validadores_automaticos CASCADE;
DROP TABLE IF EXISTS estadisticas CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS documentos CASCADE;
DROP TABLE IF EXISTS incapacidades CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

DROP TYPE IF EXISTS tipo_notificacion CASCADE;
DROP TYPE IF EXISTS estado_pago CASCADE;
DROP TYPE IF EXISTS formato_reporte CASCADE;
DROP TYPE IF EXISTS estado_incapacidad CASCADE;
DROP TYPE IF EXISTS rol CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```
