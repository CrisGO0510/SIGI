# Reportes de Empresa por Email

## Descripción

Este endpoint permite enviar reportes estadísticos de las solicitudes de incapacidad de los empleados de una empresa directamente al correo de contacto registrado.

## Endpoint

```
POST /api/email/reporte-empresa
```

**Requiere autenticación:** Sí (JWT Token)  
**Roles permitidos:** RRHH, ADMIN

## Request Body

```typescript
{
  empresa_id: string;      // UUID de la empresa (requerido)
  fechaInicio?: string;    // Fecha inicio del período (opcional, formato: YYYY-MM-DD)
  fechaFin?: string;       // Fecha fin del período (opcional, formato: YYYY-MM-DD)
}
```

### Validaciones

- `empresa_id`: Debe ser un UUID válido y la empresa debe existir en el sistema
- `fechaInicio` y `fechaFin`: Fechas opcionales para filtrar el período del reporte
- Si no se proporcionan fechas, se incluyen todas las incapacidades históricas

## Response

```typescript
{
  success: boolean;
  message: string;
  messageId?: string;
  empresa: {
    id: string;
    nombre: string;
    correo: string;
  };
  estadisticas: {
    total: number;          // Total de solicitudes
    aprobadas: number;      // Solicitudes aprobadas
    rechazadas: number;     // Solicitudes rechazadas
    pendientes: number;     // Solicitudes en estado pendiente/revisión
    montoTotal: number;     // Suma de montos aprobados
  };
}
```

## Contenido del Email

El email enviado incluye:

### 1. Header con diseño profesional
- Nombre de la empresa
- Período del reporte

### 2. Grid de Estadísticas
Muestra en formato de tarjetas:
- Total de solicitudes
- Solicitudes aprobadas (verde)
- Solicitudes rechazadas (rojo)
- Solicitudes pendientes (amarillo)
- Monto total de incapacidades aprobadas

### 3. Tabla Detallada
Tabla responsive con las siguientes columnas:
- Empleado (nombre completo)
- Motivo de la incapacidad
- Fecha de inicio
- Fecha de fin
- Días de incapacidad
- Estado (con badge de color según estado)
- Monto solicitado
- **Documento** (enlace para ver/descargar el documento adjunto)

El estado se muestra con colores:
- 🟢 **APROBADA** (verde)
- 🔴 **RECHAZADA** (rojo)
- 🟡 Otros estados (amarillo)

El documento muestra:
- 📄 **Ver** (enlace clickeable si existe documento)
- **Sin documento** (texto gris si no hay documento adjunto)

### 4. Footer
- Mensaje de que es un correo automático
- Logo/nombre del sistema SIGI

## Ejemplos de Uso

### 1. Reporte completo (todas las incapacidades)

```bash
curl -X POST http://localhost:3000/api/email/reporte-empresa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "empresa_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response exitoso:**
```json
{
  "success": true,
  "message": "Reporte enviado exitosamente a contacto@empresa.com",
  "messageId": "<abc123@gmail.com>",
  "empresa": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Empresa XYZ S.A.S.",
    "correo": "contacto@empresa.com"
  },
  "estadisticas": {
    "total": 45,
    "aprobadas": 38,
    "rechazadas": 3,
    "pendientes": 4,
    "montoTotal": 12500000
  }
}
```

### 2. Reporte con filtro de fechas (trimestre)

```bash
curl -X POST http://localhost:3000/api/email/reporte-empresa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "empresa_id": "550e8400-e29b-41d4-a716-446655440000",
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-03-31"
  }'
```

### 3. Reporte del último mes

```bash
curl -X POST http://localhost:3000/api/email/reporte-empresa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "empresa_id": "550e8400-e29b-41d4-a716-446655440000",
    "fechaInicio": "2024-11-01",
    "fechaFin": "2024-11-30"
  }'
```

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

### UUID inválido (400)
```json
{
  "statusCode": 400,
  "message": [
    "empresa_id must be a UUID"
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

### Error al enviar email (200 con success: false)
```json
{
  "success": false,
  "message": "Error al enviar el reporte",
  "error": "Connection timeout - SMTP server not responding",
  "empresa": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Empresa XYZ S.A.S.",
    "correo": "contacto@empresa.com"
  },
  "estadisticas": {
    "total": 45,
    "aprobadas": 38,
    "rechazadas": 3,
    "pendientes": 4,
    "montoTotal": 12500000
  }
}
```

## Flujo de Funcionamiento

1. **Validación de empresa**: Se verifica que la empresa exista en el sistema
2. **Obtención de empleados**: Se recuperan todos los usuarios asociados a la empresa
3. **Recopilación de incapacidades**: Se obtienen todas las incapacidades de los empleados
4. **Filtrado por fechas**: Se aplican los filtros de fecha si fueron proporcionados
5. **Cálculo de estadísticas**: Se calculan los totales y montos
6. **Generación de HTML**: Se crea el email con diseño profesional
7. **Envío de email**: Se envía el reporte al correo de contacto de la empresa
8. **Respuesta**: Se retorna el resultado con estadísticas

## Consideraciones

### Performance
- Para empresas con muchos empleados, el proceso puede tardar unos segundos
- Se recomienda usar filtros de fecha para reportes específicos

### Configuración de Email
El endpoint requiere que las siguientes variables de entorno estén configuradas:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-correo@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion
MAIL_FROM_NAME=Sistema SIGI
MAIL_FROM_EMAIL=noreply@sigi.com
```

### Límites y Restricciones
- El email incluye todas las incapacidades que coincidan con los filtros
- Para reportes muy grandes (>1000 incapacidades), considerar usar paginación o exportación a archivo
- El servicio SMTP puede tener límites de envío (ej: Gmail tiene límite de 500 emails/día)
- **URLs de documentos**: Las URLs de documentos son públicas desde Supabase Storage. Si una incapacidad tiene múltiples documentos, solo se muestra el primer documento en el reporte.
- **Documentos sin subir**: Si una incapacidad no tiene documento adjunto, se mostrará "Sin documento" en la columna correspondiente.

### Casos de Uso

1. **Reporte Mensual**: Enviar al final de cada mes el resumen de incapacidades
   ```bash
   fechaInicio: "2024-11-01"
   fechaFin: "2024-11-30"
   ```

2. **Reporte Trimestral**: Para auditorías o reportes ejecutivos
   ```bash
   fechaInicio: "2024-10-01"
   fechaFin: "2024-12-31"
   ```

3. **Reporte Anual**: Para cierre contable o fiscal
   ```bash
   fechaInicio: "2024-01-01"
   fechaFin: "2024-12-31"
   ```

4. **Reporte Completo**: Para nuevas empresas que necesitan histórico completo
   ```bash
   # No enviar fechaInicio ni fechaFin
   ```

## Testing en Swagger

El endpoint está disponible en Swagger UI en: `http://localhost:3000/api-docs`

1. Hacer clic en **Authorize** y pegar tu JWT token
2. Navegar a la sección **email**
3. Buscar el endpoint `POST /email/reporte-empresa`
4. Hacer clic en **Try it out**
5. Completar el body con el `empresa_id` y fechas opcionales
6. Hacer clic en **Execute**

## Automatización

Este endpoint puede ser integrado en tareas programadas (cron jobs) para enviar reportes automáticos:

```typescript
// Ejemplo con NestJS Schedule
@Cron('0 0 1 * *') // Primer día de cada mes a medianoche
async enviarReportesMensuales() {
  const empresas = await this.empresasService.findAll();
  
  const mesAnterior = new Date();
  mesAnterior.setMonth(mesAnterior.getMonth() - 1);
  
  const primerDia = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth(), 1);
  const ultimoDia = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth() + 1, 0);
  
  for (const empresa of empresas) {
    await this.emailController.sendReporteEmpresa({
      empresa_id: empresa.id,
      fechaInicio: primerDia.toISOString().split('T')[0],
      fechaFin: ultimoDia.toISOString().split('T')[0],
    });
  }
}
```

## Formato del Email (Ejemplo Visual)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Reporte de Incapacidades
          Empresa XYZ S.A.S.
     Período: 01/01/2024 - 31/12/2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────┐
│  Total       │  45 solicitudes          │
│  ✓ Aprobadas │  38 solicitudes          │
│  ✗ Rechazadas│   3 solicitudes          │
│  ⏳ Pendientes│   4 solicitudes          │
│  💰 Monto    │  $12,500,000 COP         │
└─────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ Empleado    │ Motivo  │ Inicio   │ Fin      │ Días │ Estado│ Monto    │ Doc     │
├──────────────────────────────────────────────────────────────────────────┤
│ Juan Pérez  │ Gripa   │ 15/01/24 │ 18/01/24 │  4   │ ✓     │ $150,000 │ 📄 Ver  │
│ Ana García  │ Cirugía │ 20/03/24 │ 10/04/24 │ 22   │ ✓     │ $800,000 │ 📄 Ver  │
│ Luis Torres │ Fractura│ 05/06/24 │ 12/06/24 │  8   │ ⏳    │ $320,000 │ Sin doc │
│ ...         │ ...     │ ...      │ ...      │ ...  │ ...   │ ...      │ ...     │
└──────────────────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este es un correo automático generado por SIGI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
