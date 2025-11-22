# 📧 Módulo de Email - SIGI API

## 📋 Descripción

Este módulo permite enviar emails a través del sistema SIGI usando SMTP. Incluye plantillas HTML personalizadas para notificaciones de incapacidades, cambios de estado y emails de bienvenida.

## 🚀 Endpoints Implementados

### 1. **POST /email/send** - Enviar email personalizado

Envía un email con contenido HTML o texto plano. **Requiere rol RRHH o ADMIN.**

**Request:**
```bash
curl -X POST http://localhost:3005/email/send \
  -H "Authorization: Bearer tu-token-rrhh-o-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "empleado@example.com",
    "subject": "Actualización de tu Incapacidad",
    "html": "<h1>Hola</h1><p>Tu incapacidad ha sido aprobada.</p>",
    "text": "Hola, tu incapacidad ha sido aprobada."
  }'
```

**Request con múltiples destinatarios:**
```json
{
  "to": ["empleado1@example.com", "empleado2@example.com"],
  "subject": "Notificación General",
  "html": "<p>Mensaje para todos</p>",
  "cc": "supervisor@example.com",
  "bcc": ["admin@example.com"]
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "messageId": "<abc123@smtp.gmail.com>",
  "message": "Email enviado exitosamente a: empleado@example.com"
}
```

---

### 2. **POST /email/test** - Enviar email de prueba

Envía un email de prueba para verificar la configuración SMTP. **Solo ADMIN.**

**Request:**
```bash
curl -X POST http://localhost:3005/email/test \
  -H "Authorization: Bearer tu-token-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "tu-email@example.com"
  }'
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "messageId": "<xyz789@smtp.gmail.com>",
  "message": "Email de prueba enviado exitosamente"
}
```

---

### 3. **POST /email/welcome** - Enviar email de bienvenida

Envía un email de bienvenida con plantilla HTML a un nuevo usuario. **Requiere rol RRHH o ADMIN.**

**Request:**
```bash
curl -X POST http://localhost:3005/email/welcome \
  -H "Authorization: Bearer tu-token-rrhh-o-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "nuevo.empleado@example.com",
    "nombre": "Juan Pérez",
    "rol": "EMPLEADO"
  }'
```

---

## ⚙️ Configuración

### Variables de Entorno

Agrega estas variables al archivo `.env` en la raíz del proyecto `/api`:

```env
# Configuración de Email/SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion
MAIL_FROM_NAME=SIGI - Sistema de Gestión de Incapacidades
MAIL_FROM_EMAIL=noreply@sigi.com
```

### Configuración con Gmail

1. **Activa la verificación en dos pasos:**
   - Ve a: https://myaccount.google.com/security
   - Activa "Verificación en dos pasos"

2. **Genera una contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Aplicación: Correo"
   - Selecciona "Dispositivo: Otro (nombre personalizado)"
   - Escribe: "SIGI API"
   - Copia la contraseña generada (16 caracteres)

3. **Configura las variables:**
   ```env
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_SECURE=false
   MAIL_USER=tu-email@gmail.com
   MAIL_PASSWORD=la-contraseña-de-16-caracteres
   MAIL_FROM_EMAIL=tu-email@gmail.com
   ```

### Configuración con Otros Proveedores

#### Outlook/Hotmail
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@outlook.com
MAIL_PASSWORD=tu-contraseña
```

#### Yahoo
```env
MAIL_HOST=smtp.mail.yahoo.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=tu-email@yahoo.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion
```

#### SendGrid
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey
MAIL_PASSWORD=tu-api-key-de-sendgrid
```

---

## 🎨 Plantillas HTML Incluidas

### 1. Email de Incapacidad Registrada
```typescript
await emailService.sendIncapacidadRegistrada(
  'empleado@example.com',
  'Juan Pérez',
  'INC-001',
  '2024-11-15',
  '2024-11-20'
);
```

Plantilla con:
- 🏥 Header verde
- 📋 Información de la incapacidad
- ✅ Estado actual
- Footer automático

### 2. Email de Cambio de Estado
```typescript
await emailService.sendCambioEstadoIncapacidad(
  'empleado@example.com',
  'Juan Pérez',
  'INC-001',
  'APROBADA',
  'Documentación completa y verificada'
);
```

Plantilla con:
- 🔄 Header azul
- Estado con emoji dinámico (✅ ❌ 🔍 ⚠️ 💰)
- Observaciones opcionales

### 3. Email de Bienvenida
```typescript
await emailService.sendWelcomeEmail(
  'nuevo@example.com',
  'María García',
  'EMPLEADO'
);
```

Plantilla con:
- 🎉 Header morado
- 👤 Información del rol
- Mensaje de bienvenida

---

## 📊 Uso Programático en Servicios

### Ejemplo en IncapacitiesService

```typescript
import { EmailService } from '../../infraestructure/email/email.service';

@Injectable()
export class IncapacitiesService {
  constructor(
    private readonly incapacidadRepo: IncapacidadRepository,
    private readonly emailService: EmailService, // Inyectar EmailService
  ) {}

  async create(dto: CreateIncapacidadDto) {
    // 1. Crear incapacidad
    const incapacidad = await this.incapacidadRepo.create(dto);

    // 2. Obtener email del usuario
    const usuario = await this.userRepo.findById(dto.usuario_id);

    // 3. Enviar email de notificación
    if (usuario?.email) {
      await this.emailService.sendIncapacidadRegistrada(
        usuario.email,
        usuario.nombre,
        incapacidad.id,
        dto.fecha_inicio.toString(),
        dto.fecha_fin.toString(),
      );
    }

    return incapacidad;
  }

  async cambiarEstado(id: string, estado: EstadoIncapacidad, observaciones?: string) {
    // 1. Actualizar estado
    const incapacidad = await this.incapacidadRepo.update(id, { estado });

    // 2. Obtener email del usuario
    const usuario = await this.userRepo.findById(incapacidad.usuario_id);

    // 3. Notificar por email
    if (usuario?.email) {
      await this.emailService.sendCambioEstadoIncapacidad(
        usuario.email,
        usuario.nombre,
        incapacidad.id,
        estado,
        observaciones,
      );
    }

    return incapacidad;
  }
}
```

### Ejemplo en AuthService

```typescript
async register(dto: RegisterDto) {
  // 1. Crear usuario
  const user = await this.userRepo.create(dto);

  // 2. Generar token
  const token = await this.generateToken(user);

  // 3. Enviar email de bienvenida
  await this.emailService.sendWelcomeEmail(
    user.email,
    user.nombre,
    user.rol,
  );

  return { access_token: token, user };
}
```

---

## 🔍 Debugging

### Verificar Conexión SMTP

Al iniciar el servidor, verás en los logs:

**✅ Si funciona:**
```
[EmailService] ✅ Conexión SMTP verificada exitosamente
```

**❌ Si falla:**
```
[EmailService] ❌ Error verificando conexión SMTP: Invalid login: 535-5.7.8 Username and Password not accepted
[EmailService] ⚠️  El servicio de email NO está disponible. Configura las variables de entorno MAIL_*
```

### Test de Configuración

1. Inicia el servidor
2. Obtén un token de ADMIN
3. Ejecuta:
```bash
curl -X POST http://localhost:3005/email/test \
  -H "Authorization: Bearer tu-token-admin" \
  -H "Content-Type: application/json" \
  -d '{"to": "tu-email-personal@gmail.com"}'
```

4. Revisa tu bandeja de entrada

---

## 🔒 Permisos de Acceso

| Endpoint | EMPLEADO | RRHH | ADMIN |
|----------|----------|------|-------|
| POST /email/send | ❌ | ✅ | ✅ |
| POST /email/test | ❌ | ❌ | ✅ |
| POST /email/welcome | ❌ | ✅ | ✅ |

**Métodos programáticos** (en servicios):
- No requieren autenticación
- Se llaman directamente desde otros servicios

---

## 🛡️ Seguridad

### ✅ Implementado

1. **Autenticación requerida** - Todos los endpoints requieren JWT
2. **Control por roles** - RRHH y ADMIN solamente
3. **Validación de DTOs** - class-validator
4. **Logs de emails** - Se registra cada envío

### ⚠️ Recomendaciones

1. **Rate Limiting** - Limitar envíos por usuario:
   ```typescript
   // 10 emails por hora por usuario
   @UseGuards(ThrottlerGuard)
   @Throttle(10, 3600)
   ```

2. **Validación de dominios** - Solo permitir emails corporativos:
   ```typescript
   @IsEmail()
   @Matches(/@(company\.com|empresa\.co)$/, {
     message: 'Solo se permiten emails corporativos'
   })
   to: string;
   ```

3. **Queue de emails** - Para envíos masivos, usar Bull:
   ```bash
   npm install --save @nestjs/bull bull
   ```

---

## 🐛 Solución de Problemas

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causa:** Credenciales incorrectas o no se usa contraseña de aplicación.

**Solución:**
1. Verifica que `MAIL_USER` y `MAIL_PASSWORD` sean correctos
2. En Gmail, usa una "Contraseña de aplicación", NO tu contraseña normal
3. Asegúrate de tener activada la verificación en dos pasos

---

### Error: "Connection timeout"

**Causa:** Puerto o host incorrectos, o firewall bloqueando.

**Solución:**
1. Verifica `MAIL_HOST` y `MAIL_PORT`
2. Para Gmail: puerto 587 con `MAIL_SECURE=false`
3. Revisa firewall/antivirus

---

### Error: "self signed certificate in certificate chain"

**Causa:** Problemas con certificados SSL.

**Solución:**
Agrega a la configuración (solo para desarrollo):
```typescript
tls: {
  rejectUnauthorized: false
}
```

---

## 📚 Referencias

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [NestJS Mailer](https://nest-modules.github.io/mailer/)

---

## 🎯 Próximos Pasos

1. Implementar queue de emails con Bull
2. Agregar más plantillas HTML
3. Integrar con servicio de notificaciones (WebSocket)
4. Dashboard de emails enviados
5. Estadísticas de apertura/clicks (con tracking pixels)
