# Relación Usuario-Empresa

## Descripción
Cada usuario del sistema puede pertenecer a una empresa. Esta relación permite:
- Organizar usuarios por empresa
- Generar reportes por empresa
- Gestionar permisos a nivel de empresa
- Enviar notificaciones específicas por empresa

## Modelo de Datos

### Tabla: `usuarios`
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_encrypted TEXT NOT NULL,
  rol VARCHAR(50) NOT NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  telefono VARCHAR(20),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `empresas`
```sql
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  correo_contacto VARCHAR(255) NOT NULL,
  direccion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Migraciones

### Migración 1: Agregar empresa_id a usuarios
Para agregar la relación a una base de datos existente, ejecuta:
```bash
psql -U postgres -d sigi_db -f api/src/database/migrations/002_add_empresa_to_usuarios.sql
```

O desde Supabase SQL Editor:
```sql
-- Ejecutar el contenido de 002_add_empresa_to_usuarios.sql
```

### Migración 2: Agregar constraint UNIQUE a nombre de empresa
Esta migración asegura que no puedan existir dos empresas con el mismo nombre:
```bash
psql -U postgres -d sigi_db -f api/src/database/migrations/003_add_unique_constraint_empresa_nombre.sql
```

O desde Supabase SQL Editor:
```sql
-- Ejecutar el contenido de 003_add_unique_constraint_empresa_nombre.sql
```

## Endpoints de Empresas

### 1. Listar Empresas (ID y Nombre) - PÚBLICO ⭐
```bash
GET /empresas/lista
# No requiere autenticación

# Respuesta:
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Tech Solutions S.A."
  },
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "nombre": "Innovación Digital Corp."
  }
]
```

**Uso:** Este endpoint es ideal para mostrar un selector de empresas en el formulario de registro.

### 2. Crear Empresa (ADMIN)
```bash
POST /empresas
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Tech Solutions S.A.",
  "correo_contacto": "contacto@techsolutions.com",
  "direccion": "Av. Principal 123"
}
```

### 3. Listar Todas las Empresas con Información Completa (ADMIN)
```bash
GET /empresas
Authorization: Bearer <token>
```

### 4. Obtener Empresa por ID (ADMIN)
```bash
GET /empresas/:id
Authorization: Bearer <token>
```

### 5. Obtener Usuarios de una Empresa (ADMIN)
```bash
GET /empresas/:id/usuarios
Authorization: Bearer <token>
```

### 6. Actualizar Empresa (ADMIN)
```bash
PATCH /empresas/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Tech Solutions S.A. - Actualizado",
  "direccion": "Nueva dirección"
}
```

### 7. Eliminar Empresa (ADMIN)
```bash
DELETE /empresas/:id
Authorization: Bearer <token>
```

## Registro de Usuario con Empresa

Al registrar un nuevo usuario, **ES OBLIGATORIO** incluir `empresa_id`.

**Flujo recomendado:**
1. Listar empresas disponibles con `GET /empresas/lista` (público, no requiere token)
2. Mostrar selector con los nombres de empresas
3. Registrar usuario con el `empresa_id` seleccionado

```bash
# Paso 1: Obtener lista de empresas (PÚBLICO)
curl -X GET http://localhost:3005/empresas/lista

# Respuesta:
# [
#   { "id": "550e8400-...", "nombre": "Tech Solutions S.A." },
#   { "id": "6ba7b810-...", "nombre": "Innovación Digital Corp." }
# ]

# Paso 2: Registrar usuario con empresa_id
curl -X POST http://localhost:3005/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol": "EMPLEADO",
    "empresa_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Validaciones al registrar:
1. ✅ El `empresa_id` es **obligatorio** (campo required)
2. ✅ Debe ser un UUID válido (formato correcto)
3. ✅ La empresa debe existir en la base de datos
4. ❌ Si la empresa no existe → Error 404

### Ejemplo de error cuando la empresa no existe:
```bash
POST /auth/register
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "rol": "EMPLEADO",
  "empresa_id": "00000000-0000-0000-0000-000000000000"
}

# Respuesta:
# ❌ 404 Not Found
# {
#   "statusCode": 404,
#   "message": "La empresa con ID 00000000-0000-0000-0000-000000000000 no existe. Por favor, verifica el ID de la empresa.",
#   "error": "Not Found"
# }
```

## Casos de Uso

### Caso 1: Flujo completo de registro (Recomendado)
```bash
# Paso 1: Un ADMIN crea una empresa
POST /empresas
Authorization: Bearer <token-admin>
{
  "nombre": "Mi Empresa Test",
  "correo_contacto": "info@miempresa.com",
  "direccion": "Calle 123"
}

# Respuesta: { "id": "abc-123-def-456", "nombre": "Mi Empresa Test", ... }

# Paso 2: Cualquiera registra un usuario con ese empresa_id
POST /auth/register
{
  "nombre": "Empleado 1",
  "email": "empleado1@miempresa.com",
  "password": "password123",
  "rol": "EMPLEADO",
  "empresa_id": "abc-123-def-456"
}
# ✅ Usuario creado exitosamente y vinculado a la empresa

# Paso 3: Verificar la relación (como ADMIN o RRHH)
GET /empresas/abc-123-def-456/usuarios
Authorization: Bearer <token-admin>
# Retorna: [{ "id": "...", "nombre": "Empleado 1", ... }]
```

### Caso 2: Manejo de nombres duplicados
```bash
# 1. Primera empresa se crea exitosamente
POST /empresas
{
  "nombre": "Tech Solutions",
  "correo_contacto": "info@tech.com"
}
# ✅ 201 Created

# 2. Intentar crear otra empresa con el mismo nombre
POST /empresas
{
  "nombre": "Tech Solutions",
  "correo_contacto": "otro@email.com"
}
# ❌ 409 Conflict
# {
#   "statusCode": 409,
#   "message": "Ya existe una empresa con el nombre \"Tech Solutions\"",
#   "error": "Conflict"
# }

# 3. Crear con nombre diferente funciona
POST /empresas
{
  "nombre": "Tech Solutions S.A.",
  "correo_contacto": "otro@email.com"
}
# ✅ 201 Created
```

### Caso 2: Manejo de nombres duplicados
```bash
# 1. Primera empresa se crea exitosamente
POST /empresas
{
  "nombre": "Tech Solutions",
  "correo_contacto": "info@tech.com"
}
# ✅ 201 Created

# 2. Intentar crear otra empresa con el mismo nombre
POST /empresas
{
  "nombre": "Tech Solutions",
  "correo_contacto": "otro@email.com"
}
# ❌ 409 Conflict
# {
#   "statusCode": 409,
#   "message": "Ya existe una empresa con el nombre \"Tech Solutions\"",
#   "error": "Conflict"
# }

# 3. Crear con nombre diferente funciona
POST /empresas
{
  "nombre": "Tech Solutions S.A.",
  "correo_contacto": "otro@email.com"
}
# ✅ 201 Created
```

### Caso 3: Ver todos los empleados de una empresa
```bash
# RRHH o ADMIN puede ver usuarios de una empresa
GET /empresas/abc-123/usuarios
```

### Caso 4: Reportes por empresa
```sql
-- Query para obtener estadísticas por empresa
SELECT 
  e.nombre as empresa,
  COUNT(DISTINCT u.id) as total_usuarios,
  COUNT(i.id) as total_incapacidades,
  SUM(p.monto) as monto_total
FROM empresas e
LEFT JOIN usuarios u ON u.empresa_id = e.id
LEFT JOIN incapacidades i ON i.usuario_id = u.id
LEFT JOIN pagos p ON p.incapacidad_id = i.id
GROUP BY e.id, e.nombre;
```

## Notas Importantes

1. **Campo OBLIGATORIO**: `empresa_id` es obligatorio (NOT NULL), todos los usuarios DEBEN pertenecer a una empresa
2. **Validación de Existencia**: El sistema valida que la empresa exista antes de crear el usuario
3. **Eliminación**: Si se elimina una empresa, `empresa_id` de usuarios se pone en NULL (ON DELETE SET NULL)
4. **Nombre Único**: El nombre de la empresa debe ser único en todo el sistema (constraint UNIQUE)
5. **Validación de Duplicados**: El sistema valida automáticamente que no se creen empresas con nombres duplicados
6. **Permisos**: 
   - Solo ADMIN puede crear/actualizar/eliminar empresas
   - Solo ADMIN puede ver información completa de empresas y sus usuarios
   - Cualquier persona puede ver la lista de nombres e IDs (endpoint público `/empresas/lista`)
7. **Flujo Recomendado**: Usar el endpoint público `/empresas/lista` para obtener empresas disponibles antes de registrar usuarios

## Próximas Mejoras

- [ ] Filtrar incapacidades por empresa en reportes
- [ ] Dashboard específico por empresa
- [ ] Notificaciones automáticas a correo de empresa
- [ ] Validación: EMPLEADO solo puede ver datos de su empresa
- [ ] Configuración de políticas por empresa
