# Envío Masivo de Reportes a Todas las Empresas

## Descripción

Este endpoint permite enviar reportes estadísticos de incapacidades a **todas las empresas registradas** en el sistema de forma masiva. Cada empresa recibirá un reporte personalizado con las incapacidades de sus propios empleados.

**Cada reporte incluye:**
- Resumen estadístico (total, aprobadas, rechazadas, pendientes, monto total)
- **3 gráficos visuales** (distribución por estado, tendencia mensual, evolución de montos)
- Tabla detallada con todas las incapacidades
- Enlaces a documentos adjuntos

## Endpoint

```
POST /api/email/reporte-todas-empresas
```

**Requiere autenticación:** Sí (JWT Token)  
**Roles permitidos:** ADMIN únicamente

## Request Body

```typescript
{
  fechaInicio?: string;    // Fecha inicio del período (opcional, formato: YYYY-MM-DD)
  fechaFin?: string;       // Fecha fin del período (opcional, formato: YYYY-MM-DD)
}
```

### Validaciones

- `fechaInicio` y `fechaFin`: Fechas opcionales para filtrar el período del reporte
- Si no se proporcionan fechas, se incluyen todas las incapacidades históricas
- Solo usuarios con rol ADMIN pueden ejecutar este endpoint

## Response

```typescript
{
  message: string;              // Resumen de envíos
  periodo: {
    inicio: string;             // Fecha de inicio del período
    fin: string;                // Fecha de fin del período
  };
  totalEmpresas: number;        // Total de empresas procesadas
  exitosos: number;             // Número de envíos exitosos
  fallidos: number;             // Número de envíos fallidos
  resultados: Array<{
    empresa: string;            // Nombre de la empresa
    correo: string;             // Correo de contacto
    success: boolean;           // Si el envío fue exitoso
    messageId?: string;         // ID del mensaje (si fue exitoso)
    estadisticas?: {            // Estadísticas del reporte (si fue exitoso)
      total: number;
      aprobadas: number;
      rechazadas: number;
      pendientes: number;
      montoTotal: number;
    };
    error?: string;             // Mensaje de error (si falló)
  }>;
}
```

## Comportamiento

### Flujo de Ejecución

1. **Obtiene todas las empresas** registradas en el sistema
2. **Para cada empresa:**
   - Obtiene todos sus empleados
   - Si no tiene empleados, omite el envío y registra el error
   - Recopila todas las incapacidades de los empleados
   - Aplica filtros de fecha si fueron proporcionados
   - Si no hay incapacidades en el período, omite el envío
   - Calcula estadísticas (total, aprobadas, rechazadas, pendientes, monto)
   - Obtiene URLs de documentos adjuntos
   - Genera y envía el email personalizado
   - Registra el resultado (exitoso o fallido)
3. **Retorna resumen** con todos los resultados

### Casos Especiales

**Empresa sin empleados:**
```json
{
  "empresa": "Empresa Sin Personal S.A.",
  "correo": "contacto@sinpersonal.com",
  "success": false,
  "error": "La empresa no tiene empleados registrados"
}
```

**Empresa sin incapacidades en el período:**
```json
{
  "empresa": "Empresa Saludable S.A.",
  "correo": "contacto@saludable.com",
  "success": false,
  "error": "No hay incapacidades en el período seleccionado"
}
```

**Error de envío de email:**
```json
{
  "empresa": "Empresa ABC S.A.",
  "correo": "invalido@empresa.com",
  "success": false,
  "error": "Connection timeout - SMTP server not responding"
}
```

## Ejemplos de Uso

### 1. Reporte completo a todas las empresas (histórico)

```bash
curl -X POST http://localhost:3000/api/email/reporte-todas-empresas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{}'
```

**Response exitoso:**
```json
{
  "message": "Reportes procesados: 8 exitosos, 2 fallidos",
  "periodo": {
    "inicio": "Desde el inicio",
    "fin": "Hasta la fecha"
  },
  "totalEmpresas": 10,
  "exitosos": 8,
  "fallidos": 2,
  "resultados": [
    {
      "empresa": "Empresa XYZ S.A.S.",
      "correo": "contacto@xyz.com",
      "success": true,
      "messageId": "<abc123@gmail.com>",
      "estadisticas": {
        "total": 45,
        "aprobadas": 38,
        "rechazadas": 3,
        "pendientes": 4,
        "montoTotal": 12500000
      }
    },
    {
      "empresa": "Empresa ABC Ltda.",
      "correo": "info@abc.com",
      "success": true,
      "messageId": "<def456@gmail.com>",
      "estadisticas": {
        "total": 23,
        "aprobadas": 20,
        "rechazadas": 1,
        "pendientes": 2,
        "montoTotal": 6800000
      }
    },
    {
      "empresa": "Empresa Sin Personal",
      "correo": "contacto@sinpersonal.com",
      "success": false,
      "error": "La empresa no tiene empleados registrados"
    }
  ]
}
```

### 2. Reportes mensuales (último mes)

```bash
curl -X POST http://localhost:3000/api/email/reporte-todas-empresas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "fechaInicio": "2024-11-01",
    "fechaFin": "2024-11-30"
  }'
```

### 3. Reportes trimestrales (Q1 2024)

```bash
curl -X POST http://localhost:3000/api/email/reporte-todas-empresas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-03-31"
  }'
```

### 4. Reportes anuales

```bash
curl -X POST http://localhost:3000/api/email/reporte-todas-empresas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-12-31"
  }'
```

## Respuestas de Error

### Sin empresas registradas (404)
```json
{
  "statusCode": 404,
  "message": "No hay empresas registradas en el sistema",
  "error": "Not Found"
}
```

### Sin autenticación (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Sin permisos ADMIN (403)
```json
{
  "statusCode": 403,
  "message": "Acceso denegado - Se requiere rol ADMIN",
  "error": "Forbidden"
}
```

## Automatización con Cron Jobs

Este endpoint está diseñado para ser usado en tareas programadas. Aquí algunos ejemplos:

### Ejemplo con NestJS Schedule

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailController } from './email.controller';

@Injectable()
export class ReportScheduler {
  constructor(private readonly emailController: EmailController) {}

  // Enviar reportes mensuales el primer día de cada mes a las 8:00 AM
  @Cron('0 8 1 * *')
  async enviarReportesMensuales() {
    const mesAnterior = new Date();
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    
    const primerDia = new Date(
      mesAnterior.getFullYear(), 
      mesAnterior.getMonth(), 
      1
    ).toISOString().split('T')[0];
    
    const ultimoDia = new Date(
      mesAnterior.getFullYear(), 
      mesAnterior.getMonth() + 1, 
      0
    ).toISOString().split('T')[0];
    
    await this.emailController.sendReporteTodasEmpresas({
      fechaInicio: primerDia,
      fechaFin: ultimoDia,
    });
  }

  // Enviar reportes semanales cada lunes a las 9:00 AM
  @Cron('0 9 * * 1')
  async enviarReportesSemanales() {
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    await this.emailController.sendReporteTodasEmpresas({
      fechaInicio: hace7Dias.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0],
    });
  }

  // Enviar reportes trimestrales
  @Cron('0 8 1 1,4,7,10 *') // 1 de enero, abril, julio, octubre
  async enviarReportesTrimestrales() {
    const hoy = new Date();
    const hace3Meses = new Date(hoy);
    hace3Meses.setMonth(hace3Meses.getMonth() - 3);
    
    await this.emailController.sendReporteTodasEmpresas({
      fechaInicio: hace3Meses.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0],
    });
  }

  // Enviar reportes anuales el 1 de enero
  @Cron('0 8 1 1 *')
  async enviarReportesAnuales() {
    const añoAnterior = new Date().getFullYear() - 1;
    
    await this.emailController.sendReporteTodasEmpresas({
      fechaInicio: `${añoAnterior}-01-01`,
      fechaFin: `${añoAnterior}-12-31`,
    });
  }
}
```

### Ejemplo con Bash Script + Crontab

**Script: `send-monthly-reports.sh`**
```bash
#!/bin/bash

# Configuración
API_URL="http://localhost:3000/api/email/reporte-todas-empresas"
ADMIN_TOKEN="tu-token-admin-aqui"

# Calcular fechas del mes anterior
FIRST_DAY=$(date -d "last month" +%Y-%m-01)
LAST_DAY=$(date -d "$(date +%Y-%m-01) -1 day" +%Y-%m-%d)

# Enviar request
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"fechaInicio\": \"$FIRST_DAY\",
    \"fechaFin\": \"$LAST_DAY\"
  }" \
  -w "\n" \
  -o /var/log/sigi-reports/$(date +%Y-%m).log

echo "Reportes mensuales enviados: $FIRST_DAY a $LAST_DAY"
```

**Crontab (ejecutar el primer día de cada mes a las 8:00 AM):**
```bash
0 8 1 * * /path/to/send-monthly-reports.sh
```

### Ejemplo con GitHub Actions

```yaml
name: Envío Mensual de Reportes

on:
  schedule:
    # Ejecutar el primer día de cada mes a las 8:00 UTC
    - cron: '0 8 1 * *'
  workflow_dispatch: # Permitir ejecución manual

jobs:
  send-reports:
    runs-on: ubuntu-latest
    steps:
      - name: Enviar reportes mensuales
        run: |
          FIRST_DAY=$(date -d "last month" +%Y-%m-01)
          LAST_DAY=$(date -d "$(date +%Y-%m-01) -1 day" +%Y-%m-%d)
          
          curl -X POST "${{ secrets.API_URL }}/email/reporte-todas-empresas" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.ADMIN_TOKEN }}" \
            -d "{
              \"fechaInicio\": \"$FIRST_DAY\",
              \"fechaFin\": \"$LAST_DAY\"
            }"
```

## Performance y Consideraciones

### Tiempo de Ejecución

- **~500ms** por empresa (promedio)
- **10 empresas**: ~5 segundos
- **100 empresas**: ~50 segundos
- **1000 empresas**: ~8 minutos

### Recomendaciones

1. **Ejecutar en horarios de bajo tráfico** (madrugada, fines de semana)
2. **Usar timeout adecuado** para requests (mínimo 10 minutos)
3. **Monitorear logs** para detectar fallos
4. **Configurar alertas** si el porcentaje de fallos supera el 10%

### Límites del Servicio SMTP

**Gmail:**
- Límite: 500 emails/día
- Recomendación: Usar cuenta G Suite/Workspace (2000 emails/día)

**SendGrid:**
- Plan gratuito: 100 emails/día
- Plan Pro: 40,000-100,000 emails/mes

**AWS SES:**
- Sin límites (con aprobación)
- Costo muy bajo

### Optimizaciones Futuras

Para sistemas con muchas empresas (>100), considerar:

1. **Procesamiento en lotes (batches)**
```typescript
const BATCH_SIZE = 10;
for (let i = 0; i < empresas.length; i += BATCH_SIZE) {
  const batch = empresas.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(empresa => enviarReporte(empresa)));
}
```

2. **Cola de trabajos (Bull/Redis)**
```typescript
await reportQueue.add('send-report', {
  empresaId: empresa.id,
  fechaInicio,
  fechaFin,
});
```

3. **Procesamiento asíncrono**
```typescript
// Retornar inmediatamente y procesar en background
return { message: 'Reportes en proceso', jobId: '...' };
```

## Testing en Swagger

1. Ir a: `http://localhost:3000/api-docs`
2. Hacer clic en **Authorize** y pegar tu JWT token de ADMIN
3. Navegar a la sección **email**
4. Buscar `POST /email/reporte-todas-empresas`
5. Hacer clic en **Try it out**
6. Opcional: Agregar fechas de inicio y fin
7. Hacer clic en **Execute**
8. Ver los resultados con el detalle de cada empresa

## Monitoreo y Logs

### Ejemplo de Log Exitoso

```
[INFO] Enviando reportes a 15 empresas
[INFO] Empresa XYZ S.A.S.: ✓ Enviado (45 incapacidades)
[INFO] Empresa ABC Ltda.: ✓ Enviado (23 incapacidades)
[WARN] Empresa Sin Personal: ✗ Sin empleados
[INFO] Empresa 123 Corp.: ✓ Enviado (67 incapacidades)
[INFO] Resumen: 12 exitosos, 3 fallidos
```

### Métricas Recomendadas

- Tasa de éxito/fallo
- Tiempo promedio de envío
- Empresas más grandes (más incapacidades)
- Empresas sin actividad
- Errores SMTP más comunes

## Diferencias con `/reporte-empresa`

| Característica | `/reporte-empresa` | `/reporte-todas-empresas` |
|----------------|-------------------|---------------------------|
| **Alcance** | Una empresa específica | Todas las empresas |
| **Parámetro empresa_id** | ✅ Requerido | ❌ No aplica |
| **Rol requerido** | RRHH o ADMIN | ADMIN únicamente |
| **Uso típico** | Manual, on-demand | Automatizado, cron jobs |
| **Tiempo de ejecución** | <1 segundo | Variable (segundos a minutos) |
| **Response** | Detalle de una empresa | Resumen + array de resultados |
| **Error handling** | Falla si empresa no existe | Continúa con otras empresas |
