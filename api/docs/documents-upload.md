# Módulo de Documentos - Upload a Supabase Storage

## 📋 Descripción

Este módulo permite subir documentos asociados a incapacidades. Los archivos se almacenan en **Supabase Storage** en el bucket `documentos`, y la información se registra en la tabla `documentos` de la base de datos.

## 🚀 Endpoints Implementados

### 1. **POST /documents/upload** - Subir documento
Sube un archivo al storage de Supabase y crea el registro en la base de datos.

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `file` (archivo): El archivo a subir
- `incapacidadId` (string): UUID de la incapacidad
- `tipoDocumento` (string): Tipo de documento (ej: "pdf_incapacidad", "soporte_medico")
- `descripcion` (string, opcional): Descripción del documento

**Validaciones:**
- Tamaño máximo: 10MB
- Formatos permitidos: PDF, PNG, JPG, JPEG

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3005/documents/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/home/usuario/documento.pdf" \
  -F "incapacidadId=123e4567-e89b-12d3-a456-426614174000" \
  -F "tipoDocumento=pdf_incapacidad" \
  -F "descripcion=Incapacidad por gripe del 15 al 20 de noviembre"
```

**Ejemplo con Postman:**
1. Selecciona el método **POST**
2. URL: `http://localhost:3005/documents/upload`
3. En la pestaña **Authorization**, selecciona **Bearer Token** y pega tu JWT
4. En la pestaña **Body**, selecciona **form-data**
5. Agrega los siguientes campos:
   - `file` (tipo: File) - Selecciona el archivo
   - `incapacidadId` (tipo: Text)
   - `tipoDocumento` (tipo: Text)
   - `descripcion` (tipo: Text)

**Respuesta (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "incapacidad_id": "987e6543-e21b-45c6-a789-123456789abc",
  "nombre_archivo": "incapacidad.pdf",
  "formato": "PDF",
  "tamano_bytes": 245678,
  "storage_path": "incapacidades/1732198765432-abc123def456.pdf",
  "fecha_subida": "2024-11-21T10:30:00.000Z",
  "validado": false,
  "hash": "",
  "created_at": "2024-11-21T10:30:00.000Z"
}
```

### 2. **GET /documents/incapacidad/:incapacidadId** - Obtener documentos de una incapacidad
Lista todos los documentos asociados a una incapacidad específica.

**Ejemplo:**
```bash
curl -X GET http://localhost:3005/documents/incapacidad/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer tu-token-aqui"
```

### 3. **GET /documents/:id** - Obtener un documento por ID
Obtiene la información de un documento específico.

**Ejemplo:**
```bash
curl -X GET http://localhost:3005/documents/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer tu-token-aqui"
```

### 4. **DELETE /documents/:id** - Eliminar un documento
Elimina el documento tanto del storage de Supabase como de la base de datos.

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3005/documents/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer tu-token-aqui"
```

## 🗄️ Estructura de Storage en Supabase

Los archivos se almacenan con la siguiente estructura:

```
documentos/                          (bucket)
└── incapacidades/                   (carpeta)
    ├── 1732198765432-abc123def456.pdf
    ├── 1732198765433-def456ghi789.jpg
    └── ...
```

El nombre del archivo se genera automáticamente con:
- Timestamp actual (milisegundos)
- String aleatorio
- Extensión original del archivo

## 📦 Configuración de Supabase Storage

### 1. Crear el bucket en Supabase

Ve a tu proyecto en Supabase → Storage → Create Bucket:
- **Nombre:** `documentos`
- **Público:** Sí (para poder acceder a las URLs públicas)

### 2. Configurar políticas de seguridad (RLS)

En Supabase SQL Editor, ejecuta:

```sql
-- Permitir subir archivos autenticados
CREATE POLICY "Usuarios autenticados pueden subir documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Permitir leer archivos públicos
CREATE POLICY "Todos pueden leer documentos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentos');

-- Permitir eliminar archivos propios
CREATE POLICY "Usuarios pueden eliminar sus documentos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');
```

## 🔧 Servicios y Arquitectura

### SupabaseStorageService
Servicio que maneja la interacción con Supabase Storage:
- `uploadFile()` - Sube un archivo al bucket
- `deleteFile()` - Elimina un archivo del bucket
- `getPublicUrl()` - Obtiene la URL pública de un archivo
- `fileExists()` - Verifica si un archivo existe

### DocumentsService
Servicio de negocio que coordina:
- Subida de archivos al storage
- Creación de registros en la BD
- Validaciones de negocio
- Eliminación coordinada (storage + BD)

### DocumentoRepository
Repositorio que extiende `BaseRepository<Documento>` con métodos específicos:
- `findByIncapacidad()` - Documentos de una incapacidad
- `findByFormato()` - Documentos por formato (PDF, CSV)
- `findNoValidados()` - Documentos pendientes de validación
- `marcarComoValidado()` - Aprobar un documento
- `rechazarDocumento()` - Rechazar un documento

## 🧪 Testing

### Probar con Swagger UI

1. Ve a `http://localhost:3005/docs`
2. Haz clic en **Authorize** 🔒
3. Pega tu JWT token
4. Ve a **POST /documents/upload**
5. Haz clic en **Try it out**
6. Sube un archivo y completa los campos
7. Haz clic en **Execute**

### Probar con Angular (Frontend)

```typescript
// documents.service.ts
uploadDocumento(incapacidadId: string, file: File, descripcion?: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('incapacidadId', incapacidadId);
  formData.append('tipoDocumento', 'pdf_incapacidad');
  if (descripcion) {
    formData.append('descripcion', descripcion);
  }

  return this.http.post(`${this.apiUrl}/documents/upload`, formData);
}
```

## 🐛 Solución de Problemas

### Error: "Bucket 'documentos' does not exist"
- Verifica que hayas creado el bucket `documentos` en Supabase Storage
- Asegúrate de que el bucket sea público

### Error: "new row violates row-level security policy"
- Verifica las políticas RLS en Supabase
- Asegúrate de tener las políticas de INSERT, SELECT y DELETE configuradas

### Error: "File too large"
- El tamaño máximo es 10MB
- Puedes ajustarlo en `DocumentsController` modificando el `MaxFileSizeValidator`

### Error: "Invalid file type"
- Solo se permiten: PDF, PNG, JPG, JPEG
- Puedes agregar más tipos en el `FileTypeValidator`

## 📝 Notas Importantes

1. **Bucket Público:** El bucket `documentos` debe ser público para que las URLs funcionen correctamente.

2. **Nombres Únicos:** Los archivos se renombran automáticamente con timestamp + random string para evitar colisiones.

3. **Eliminación Coordinada:** Al eliminar un documento, se elimina tanto del storage como de la BD.

4. **Hash de Archivos:** Actualmente el campo `hash` está vacío. Puedes implementar cálculo de MD5/SHA256 para detectar duplicados.

5. **Validación de Documentos:** Los documentos se crean con `validado: false`. Implementa lógica adicional para validación automática o manual.

## 🔐 Seguridad

- Todos los endpoints requieren autenticación (JWT)
- Los archivos se validan antes de subir (tamaño y tipo)
- Los nombres de archivo se sanitizan para evitar path traversal
- Las URLs públicas son accesibles pero los nombres son aleatorios

## 📚 Próximos Pasos

1. Implementar cálculo de hash para detectar duplicados
2. Agregar validación automática de documentos PDF
3. Implementar límites de cuota por usuario
4. Agregar generación de thumbnails para imágenes
5. Implementar compresión de imágenes antes de subir
