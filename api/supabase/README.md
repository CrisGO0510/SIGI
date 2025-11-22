# Guía de Sincronización con Supabase

Esta carpeta contiene las migraciones y configuración para sincronizar el esquema de la base de datos con Supabase.

## 📥 Recuperar migración desde Supabase

### Método 1: Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# 2. Login en Supabase
supabase login

# 3. Vincular proyecto (solo la primera vez)
cd api
supabase link --project-ref <tu-project-ref>

# 4. Descargar esquema actual desde Supabase
supabase db pull

# Esto creará un archivo en api/supabase/migrations/ con el esquema actual
```

**¿Dónde encuentro mi project-ref?**
- Dashboard de Supabase → Settings → General → Reference ID

### Método 2: SQL Editor en Dashboard

1. Ve a https://supabase.com/dashboard/project/[tu-proyecto]/sql
2. Ejecuta este query para ver la estructura completa:

```sql
-- Ver todas las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Ver estructura de una tabla específica
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'usuarios'
ORDER BY ordinal_position;
```

3. Para exportar DDL completo, usa:
```sql
SELECT 
  'CREATE TABLE ' || table_name || E' (\n  ' ||
  string_agg(
    column_name || ' ' || 
    CASE 
      WHEN data_type = 'USER-DEFINED' THEN udt_name
      ELSE data_type 
    END ||
    CASE 
      WHEN character_maximum_length IS NOT NULL 
      THEN '(' || character_maximum_length || ')'
      ELSE ''
    END ||
    CASE 
      WHEN is_nullable = 'NO' THEN ' NOT NULL'
      ELSE ''
    END,
    E',\n  '
  ) || E'\n);'
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name;
```

### Método 3: pg_dump

```bash
# Obtén la connection string de Supabase:
# Dashboard → Settings → Database → Connection string (URI)

# Exportar solo esquema
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --schema-only \
  --no-owner \
  --no-acl \
  -f api/src/database/migrations/recovered_schema.sql

# Exportar esquema + datos
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  -f api/src/database/migrations/full_backup.sql
```

## 🔄 Flujo de trabajo recomendado

### Desarrollo local → Supabase
```bash
# 1. Crear migración local
echo "ALTER TABLE usuarios ADD COLUMN avatar_url TEXT;" > api/supabase/migrations/002_add_avatar.sql

# 2. Aplicar a Supabase
supabase db push
```

### Supabase → Local (recuperar cambios)
```bash
# Si hiciste cambios en el dashboard de Supabase
supabase db pull
```

## 📋 Comandos útiles

```bash
# Ver diferencias entre local y remoto
supabase db diff

# Ver historial de migraciones aplicadas
supabase migration list

# Crear una nueva migración vacía
supabase migration new <nombre>

# Resetear base de datos local (desarrollo)
supabase db reset
```

## 🗂️ Estructura de carpetas

```
api/
├── supabase/
│   ├── config.toml          # Configuración de Supabase CLI
│   └── migrations/          # Migraciones generadas por CLI
│       └── 20251121_xxxxx_initial_schema.sql
└── src/
    └── database/
        └── migrations/      # Migraciones manuales (legacy)
            └── 001_initial_schema.sql
```

## ⚠️ Buenas prácticas

1. **Versionado**: Siempre commitea las migraciones en Git
2. **Sincronización**: Usa `supabase db pull` después de cambios en dashboard
3. **Testing**: Prueba migraciones localmente antes de `db push`
4. **Backups**: Exporta periódicamente con `pg_dump`

## 🔐 Seguridad

**NUNCA** comitees:
- Passwords de la base de datos
- API keys de Supabase
- Connection strings con credenciales

Usa variables de entorno en `.env`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
DATABASE_URL=postgresql://...
```
