# Descarga de Reportes en PDF y CSV

## Descripción

Este endpoint permite descargar reportes de incapacidades de una empresa específica en dos formatos diferentes: **PDF** (para presentaciones e impresión) o **CSV** (para análisis de datos).

## Endpoint

```
GET /api/email/descargar-reporte
```

**Requiere autenticación:** Sí (JWT Token)  
**Roles permitidos:** RRHH, ADMIN

## Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `empresa_id` | UUID | ✅ | ID de la empresa | `550e8400-e29b-41d4-a716-446655440000` |
| `formato` | Enum | ✅ | Formato del reporte (`PDF` o `CSV`) | `PDF` |
| `fechaInicio` | String | ❌ | Fecha inicio (YYYY-MM-DD) | `2024-01-01` |
| `fechaFin` | String | ❌ | Fecha fin (YYYY-MM-DD) | `2024-12-31` |

### Validaciones

- `empresa_id`: Debe ser un UUID válido y la empresa debe existir
- `formato`: Debe ser exactamente `PDF` o `CSV` (case-sensitive)
- `fechaInicio` y `fechaFin`: Formato ISO 8601 (YYYY-MM-DD)
- Si no se proporcionan fechas, se incluyen todas las incapacidades históricas

## Response

**Content-Type:**
- PDF: `application/pdf`
- CSV: `text/csv; charset=utf-8`

**Content-Disposition:** `attachment; filename="reporte_Empresa_XYZ_2024-11-22.pdf"`

**Archivo binario** descargable directamente

## Formatos Disponibles

### 📄 PDF - Reporte Profesional

**Características:**
- ✅ Diseño profesional con colores corporativos
- ✅ Header con nombre de empresa y período
- ✅ Cajas de estadísticas visuales con colores
- ✅ Tabla formateada con bordes y colores
- ✅ Paginación automática (múltiples páginas si es necesario)
- ✅ Footer con fecha de generación y número de página
- ✅ Compatible con cualquier visor de PDF

**Estructura del PDF:**

```
┌────────────────────────────────────────┐
│   Reporte de Incapacidades             │
│   Empresa XYZ S.A.S.                   │
│   Período: 01/01/2024 al 31/12/2024    │
├────────────────────────────────────────┤
│                                        │
│ 📊 Resumen Estadístico                 │
│                                        │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│ │ 45 │ │ 38 │ │ 3  │ │ 4  │           │
│ │Tot │ │Apr │ │Rech│ │Pend│           │
│ └────┘ └────┘ └────┘ └────┘           │
│                                        │
│ ┌─────────────────────┐                │
│ │ $12,500,000 COP     │                │
│ │ Monto Total         │                │
│ └─────────────────────┘                │
│                                        │
│ 📋 Detalle de Incapacidades            │
│                                        │
│ ┌────────────────────────────────┐    │
│ │ Empleado │ Motivo │ ... │ Monto│    │
│ ├──────────┼────────┼─────┼──────┤    │
│ │ Juan P.  │ Gripa  │ ... │ $150k│    │
│ │ Ana G.   │ Cirugía│ ... │ $800k│    │
│ │ ...      │ ...    │ ... │ ...  │    │
│ └────────────────────────────────┘    │
│                                        │
├────────────────────────────────────────┤
│ Generado el 22/11/2024 | Página 1/3   │
└────────────────────────────────────────┘
```

**Colores utilizados:**
- Header: Gradiente púrpura (#667eea)
- Total: Púrpura (#667eea)
- Aprobadas: Verde (#4CAF50)
- Rechazadas: Rojo (#f44336)
- Pendientes: Amarillo (#FFC107)
- Monto Total: Verde (#4CAF50)

**Fuentes:**
- Títulos: Helvetica Bold
- Contenido: Helvetica Regular
- Tamaños: 8pt (tabla) a 24pt (título principal)

---

### 📊 CSV - Análisis de Datos

**Características:**
- ✅ Formato de texto plano separado por comas
- ✅ Compatible con Excel, Google Sheets, LibreOffice
- ✅ BOM incluido para correcta visualización en Excel
- ✅ Escapeo automático de comillas y comas
- ✅ Incluye URLs de documentos adjuntos
- ✅ Ideal para pivot tables y análisis

**Estructura del CSV:**

```csv
Reporte de Incapacidades
Empresa,Empresa XYZ S.A.S.
Período,01/01/2024 al 31/12/2024

RESUMEN ESTADÍSTICO
Total Incapacidades,45
Aprobadas,38
Rechazadas,3
Pendientes,4
Monto Total Aprobado,$12,500,000 COP

DETALLE DE INCAPACIDADES
Empleado,Motivo,Fecha Inicio,Fecha Fin,Días,Estado,Monto,URL Documento
Juan Pérez,Gripa,15/1/2024,18/1/2024,4,APROBADA,$150,000,https://storage.supabase.co/...
Ana García,Cirugía,20/3/2024,10/4/2024,22,APROBADA,$800,000,https://storage.supabase.co/...
Luis Torres,Fractura,5/6/2024,12/6/2024,8,PENDIENTE_REVISION,$320,000,Sin documento
```

**Manejo especial:**
- Comillas: Escapadas como `""`
- Comas en valores: Valor completo entre comillas
- Saltos de línea: Reemplazados o valor entre comillas
- BOM UTF-8: `\uFEFF` al inicio para Excel

---

## Ejemplos de Uso

### 1. Descargar PDF - Reporte Completo

```bash
curl -X GET "http://localhost:3000/api/email/descargar-reporte?empresa_id=550e8400-e29b-41d4-a716-446655440000&formato=PDF" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --output reporte_completo.pdf
```

**Resultado:** Archivo `reporte_completo.pdf` con todas las incapacidades históricas

---

### 2. Descargar CSV - Período Específico

```bash
curl -X GET "http://localhost:3000/api/email/descargar-reporte?empresa_id=550e8400-e29b-41d4-a716-446655440000&formato=CSV&fechaInicio=2024-01-01&fechaFin=2024-03-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --output reporte_Q1.csv
```

**Resultado:** Archivo `reporte_Q1.csv` con incapacidades del Q1 2024

---

### 3. Descargar PDF - Último Mes

```bash
curl -X GET "http://localhost:3000/api/email/descargar-reporte?empresa_id=550e8400-e29b-41d4-a716-446655440000&formato=PDF&fechaInicio=2024-11-01&fechaFin=2024-11-30" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --output reporte_noviembre.pdf
```

---

### 4. Desde el Navegador (Swagger)

1. Ir a: `http://localhost:3000/api-docs`
2. Hacer clic en **Authorize** y pegar el JWT token
3. Navegar a la sección **email**
4. Buscar `GET /email/descargar-reporte`
5. Hacer clic en **Try it out**
6. Completar parámetros:
   - `empresa_id`: UUID de la empresa
   - `formato`: PDF o CSV
   - `fechaInicio`: (opcional)
   - `fechaFin`: (opcional)
7. Hacer clic en **Execute**
8. Hacer clic en **Download file** en la respuesta

---

### 5. Desde JavaScript/Frontend

```javascript
// Con Fetch API
async function descargarReporte(empresaId, formato, fechaInicio, fechaFin) {
  const params = new URLSearchParams({
    empresa_id: empresaId,
    formato: formato,
  });
  
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const response = await fetch(
    `http://localhost:3000/api/email/descargar-reporte?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Error al descargar reporte');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_${formato.toLowerCase()}_${new Date().toISOString().split('T')[0]}.${formato.toLowerCase()}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

// Uso
await descargarReporte(
  '550e8400-e29b-41d4-a716-446655440000',
  'PDF',
  '2024-01-01',
  '2024-12-31'
);
```

---

### 6. Desde Angular

```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';

descargarReporte(empresaId: string, formato: 'PDF' | 'CSV', fechaInicio?: string, fechaFin?: string) {
  const params: any = {
    empresa_id: empresaId,
    formato: formato,
  };
  
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;

  this.http.get('http://localhost:3000/api/email/descargar-reporte', {
    params,
    headers: new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    }),
    responseType: 'blob',
  }).subscribe((blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${formato}.${formato.toLowerCase()}`;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}
```

---

## Respuestas de Error

### Empresa no encontrada (404)
```json
{
  "statusCode": 404,
  "message": "Empresa con ID 550e8400-e29b-41d4-a716-446655440000 no encontrada",
  "error": "Not Found"
}
```

### Empresa sin empleados (400)
```json
{
  "statusCode": 400,
  "message": "La empresa no tiene empleados registrados",
  "error": "Bad Request"
}
```

### Formato inválido (400)
```json
{
  "statusCode": 400,
  "message": [
    "formato must be one of the following values: PDF, CSV"
  ],
  "error": "Bad Request"
}
```

### Sin autenticación (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Sin permisos (403)
```json
{
  "statusCode": 403,
  "message": "Acceso denegado - Se requiere rol RRHH o ADMIN",
  "error": "Forbidden"
}
```

---

## Comparación de Formatos

| Característica | PDF | CSV |
|----------------|-----|-----|
| **Diseño visual** | ✅ Profesional con colores | ❌ Texto plano |
| **Impresión** | ✅ Óptimo | ⚠️ Básico |
| **Análisis de datos** | ❌ No editable | ✅ Excelente |
| **Excel/Sheets** | ❌ No compatible | ✅ Totalmente compatible |
| **URLs de documentos** | ❌ No incluidas | ✅ Incluidas |
| **Tamaño de archivo** | ⚠️ Mayor (~50-200KB) | ✅ Menor (~5-20KB) |
| **Paginación** | ✅ Automática | ❌ N/A |
| **Compartir** | ✅ Universal | ⚠️ Requiere software |
| **Edición** | ❌ No editable | ✅ Editable |
| **Presentaciones** | ✅ Ideal | ❌ No recomendado |

**Recomendaciones:**
- **PDF:** Para presentaciones, reportes ejecutivos, impresión, compartir con stakeholders
- **CSV:** Para análisis de datos, pivot tables, importar a otros sistemas, procesamiento automatizado

---

## Casos de Uso

### 1. Reporte Mensual para Dirección
**Formato:** PDF  
**Uso:** Presentación ejecutiva del estado de incapacidades

```bash
curl -X GET "http://localhost:3000/api/email/descargar-reporte?empresa_id=xxx&formato=PDF&fechaInicio=2024-11-01&fechaFin=2024-11-30" \
  -H "Authorization: Bearer <token>" \
  --output reporte_ejecutivo_noviembre.pdf
```

---

### 2. Análisis de Tendencias en Excel
**Formato:** CSV  
**Uso:** Crear pivot tables y gráficos en Excel

```bash
curl -X GET "http://localhost:3000/api/email/descargar-reporte?empresa_id=xxx&formato=CSV&fechaInicio=2024-01-01&fechaFin=2024-12-31" \
  -H "Authorization: Bearer <token>" \
  --output datos_analisis_2024.csv
```

Luego en Excel:
1. Abrir `datos_analisis_2024.csv`
2. Insertar → Tabla dinámica
3. Crear gráficos de tendencias por mes
4. Analizar patrones de incapacidades

---

### 3. Auditoría Anual
**Formato:** PDF  
**Uso:** Archivo para auditoría externa o interna

```bash
curl -X GET "http://localhost:3000/api/email/descargar-reporte?empresa_id=xxx&formato=PDF&fechaInicio=2024-01-01&fechaFin=2024-12-31" \
  -H "Authorization: Bearer <token>" \
  --output auditoria_2024.pdf
```

---

### 4. Integración con Sistema Contable
**Formato:** CSV  
**Uso:** Importar datos a sistema de nómina/contabilidad

```bash
# Descargar CSV
curl -X GET "http://localhost:3000/api/email/descargar-reporte?empresa_id=xxx&formato=CSV" \
  -H "Authorization: Bearer <token>" \
  --output import_data.csv

# Procesar con script
python process_incapacidades.py import_data.csv
```

---

## Consideraciones Técnicas

### Performance

**PDF:**
- Tiempo de generación: ~500ms - 2s (depende del número de registros)
- Tamaño: ~10KB + ~5KB por incapacidad
- Paginación automática: Nueva página cada ~20-25 registros

**CSV:**
- Tiempo de generación: ~10-50ms
- Tamaño: ~200 bytes por incapacidad
- Sin límite de registros (texto plano)

### Límites

| Límite | Valor | Recomendación |
|--------|-------|---------------|
| Máx. incapacidades PDF | ~1000 | Para más registros, usar filtros de fecha |
| Máx. incapacidades CSV | Sin límite | Funciona con cualquier cantidad |
| Timeout request | 30 segundos | Suficiente para reportes grandes |
| Tamaño máx. PDF | ~10MB | Raro de alcanzar en uso normal |

### Compatibilidad

**PDF:**
- ✅ Adobe Reader
- ✅ Chrome/Firefox/Safari
- ✅ Preview (macOS)
- ✅ Microsoft Edge
- ✅ Aplicaciones móviles de PDF

**CSV:**
- ✅ Microsoft Excel 2010+
- ✅ Google Sheets
- ✅ LibreOffice Calc
- ✅ Apple Numbers
- ✅ Cualquier editor de texto

---

## Seguridad

- ✅ **Autenticación obligatoria:** JWT token requerido
- ✅ **Autorización por roles:** Solo RRHH y ADMIN
- ✅ **Validación de empresa:** Verifica que la empresa exista
- ✅ **Filtrado de datos:** Solo se incluyen incapacidades de la empresa solicitada
- ✅ **Headers seguros:** Content-Disposition con attachment para forzar descarga
- ✅ **Sin persistencia:** Archivos generados on-the-fly, no se guardan en servidor

---

## Troubleshooting

### PDF no se descarga correctamente

**Problema:** El navegador muestra el PDF en lugar de descargarlo

**Solución:**
```bash
# Usar curl con --output
curl -X GET "..." --output reporte.pdf

# O agregar header Accept
curl -X GET "..." -H "Accept: application/pdf" --output reporte.pdf
```

---

### CSV con caracteres extraños en Excel

**Problema:** Caracteres especiales (tildes, ñ) se ven mal

**Solución:** El BOM UTF-8 ya está incluido. Si persiste:
1. Abrir Excel
2. Datos → Desde texto/CSV
3. Seleccionar archivo
4. Encoding: UTF-8
5. Importar

---

### Error de timeout en reportes grandes

**Problema:** Request timeout con muchos datos

**Solución:**
```bash
# Usar filtros de fecha para reducir datos
?fechaInicio=2024-11-01&fechaFin=2024-11-30

# O aumentar timeout en el cliente
curl --max-time 60 ...
```

---

## Testing en Swagger

1. Navegar a: `http://localhost:3000/api-docs`
2. Autorizar con token RRHH o ADMIN
3. Endpoint: `GET /email/descargar-reporte`
4. Parámetros de prueba:
   - `empresa_id`: Copiar un UUID real de una empresa
   - `formato`: Probar ambos (PDF y CSV)
   - `fechaInicio`: 2024-01-01
   - `fechaFin`: 2024-12-31
5. Execute
6. Download file button aparecerá
7. Abrir archivo descargado para verificar

---

## Integración con Reports Module

Este endpoint puede ser usado en conjunto con el módulo de reportes existente:

```typescript
// Generar reporte automáticamente y descargarlo
async function generarYDescargarReporte(empresaId: string) {
  // 1. Generar reporte en el sistema (si existe este endpoint)
  await fetch('/api/reports', {
    method: 'POST',
    body: JSON.stringify({ empresaId, tipo: 'mensual' }),
  });

  // 2. Descargar PDF
  await descargarReporte(empresaId, 'PDF');
}
```

---

## Mejoras Futuras

### Posibles Adiciones

1. **Más formatos:**
   - Excel (.xlsx) con múltiples hojas y gráficos
   - JSON para integraciones API

2. **Personalización de PDF:**
   - Logo de la empresa
   - Colores corporativos personalizados
   - Firma digital

3. **Compresión:**
   - ZIP para múltiples reportes
   - Compresión de PDFs grandes

4. **Plantillas:**
   - Diferentes layouts de PDF
   - Plantillas personalizables por empresa

5. **Scheduling:**
   - Generar y enviar reportes automáticamente
   - Almacenar histórico de reportes

---

## Resumen

El endpoint `/email/descargar-reporte` proporciona:

✅ **Dos formatos:** PDF (presentación) y CSV (análisis)  
✅ **Filtros flexibles:** Por período de fechas  
✅ **Diseño profesional:** PDF con colores y estructura  
✅ **Compatibilidad universal:** Funciona con todos los visores  
✅ **Performance óptimo:** Generación rápida on-the-fly  
✅ **Seguridad robusta:** Autenticación y autorización  
✅ **Fácil integración:** Swagger, curl, JavaScript, Angular  

Ideal para reportería ejecutiva, análisis de datos, auditorías y presentaciones.
