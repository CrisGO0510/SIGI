# 🔐 Sistema de Autenticación - SIGI

Sistema completo de autenticación con JWT, guards de autorización y control de roles.

---

## 📋 Arquitectura de Autenticación

### Flujo de Autenticación
```
1. Usuario hace login → POST /auth/login
2. Backend valida credenciales en Supabase
3. Si válido → genera JWT token (válido 7 días)
4. Frontend guarda token en localStorage
5. Frontend envía token en cada request:
   Header: Authorization: Bearer <token>
6. AuthGuard intercepta request → valida token
7. Si válido → extrae usuario y permite acceso
8. Si inválido → retorna 401 Unauthorized
```

### Niveles de Protección

| Nivel | Decoradores | Acceso |
|-------|-------------|--------|
| 🟢 Público | `@Public()` | Cualquiera (sin token) |
| 🟡 Autenticado | Sin decoradores | Usuario con token válido |
| 🟠 Por Rol | `@Roles(Rol.X)` | Solo roles específicos |

---

## 🚀 Endpoints Disponibles

### 🔓 Endpoints Públicos (sin autenticación)

#### POST /auth/register
Registrar nuevo usuario
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol": "EMPLEADO"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "EMPLEADO"
  }
}
```

#### POST /auth/login
Login de usuario existente
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "EMPLEADO"
  }
}
```

---

### 🔒 Endpoints Autenticados (requieren token)

#### GET /auth/me
Obtener perfil del usuario autenticado
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <tu-token-aqui>"
```

**Response:**
```json
{
  "message": "Usuario autenticado",
  "user": {
    "id": "uuid-123",
    "email": "juan@example.com",
    "rol": "EMPLEADO",
    "nombre": "Juan Pérez"
  }
}
```

#### POST /auth/validate
Validar si un token es válido
```bash
curl -X POST http://localhost:3000/auth/validate \
  -H "Authorization: Bearer <tu-token-aqui>"
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid-123",
    "email": "juan@example.com",
    "rol": "EMPLEADO",
    "nombre": "Juan Pérez"
  }
}
```

#### POST /auth/refresh
Refrescar token (generar uno nuevo)
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer <tu-token-aqui>"
```

---

### 👥 Endpoints con Control de Roles

#### GET /users
Listar todos los usuarios (solo ADMIN y RRHH)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <token-admin-o-rrhh>"
```

#### GET /users/admins
Listar administradores (solo ADMIN)
```bash
curl -X GET http://localhost:3000/users/admins \
  -H "Authorization: Bearer <token-admin>"
```

---

## 💻 Integración Frontend (Angular)

### 1. Servicio de Autenticación

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: 'EMPLEADO' | 'RRHH' | 'ADMIN';
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar usuario desde localStorage al iniciar
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        // Guardar token y usuario en localStorage
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/register`, data).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserFromStorage(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return roles.includes(user?.rol);
  }
}
```

### 2. HTTP Interceptor (Adjuntar Token)

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};

// Registrar en app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    // ... otros providers
  ]
};
```

### 3. Route Guards

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// role.guard.ts
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
```

### 4. Uso en Rutas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Rutas protegidas (requieren autenticación)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  // Rutas con control de roles
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  
  {
    path: 'rrhh',
    component: RRHHComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'RRHH'])]
  },
];
```

### 5. Componente de Login

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response.user);
        
        // Redirigir según el rol
        switch(response.user.rol) {
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          case 'RRHH':
            this.router.navigate(['/rrhh']);
            break;
          case 'EMPLEADO':
            this.router.navigate(['/dashboard']);
            break;
        }
      },
      error: (err) => {
        this.error = 'Credenciales inválidas';
        console.error('Error de login:', err);
      }
    });
  }
}
```

### 6. Mostrar/Ocultar según Rol

```html
<!-- dashboard.component.html -->
<div *ngIf="authService.currentUser$ | async as user">
  <h1>Bienvenido, {{ user.nombre }}</h1>
  <p>Rol: {{ user.rol }}</p>

  <!-- Solo para ADMIN -->
  <button *ngIf="user.rol === 'ADMIN'">
    Panel de Administración
  </button>

  <!-- Solo para ADMIN y RRHH -->
  <button *ngIf="user.rol === 'ADMIN' || user.rol === 'RRHH'">
    Ver Reportes
  </button>
</div>
```

---

## 🛡️ Uso en el Backend

### Ejemplo 1: Endpoint Público
```typescript
@Controller('public')
export class PublicController {
  @Public()
  @Get('info')
  getPublicInfo() {
    return { message: 'Información pública' };
  }
}
```

### Ejemplo 2: Endpoint Autenticado
```typescript
@Controller('incapacities')
export class IncapacitiesController {
  // AuthGuard está aplicado globalmente
  @Get('my-incapacities')
  getMyIncapacities(@CurrentUser('id') userId: string) {
    return this.service.findByUser(userId);
  }
}
```

### Ejemplo 3: Endpoint con Roles
```typescript
@Controller('admin')
export class AdminController {
  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN)
  @Get('stats')
  getStats() {
    return this.service.getAdminStats();
  }

  @UseGuards(RoleGuard)
  @Roles(Rol.ADMIN, Rol.RRHH)
  @Get('reports')
  getReports() {
    return this.service.getReports();
  }
}
```

---

## 🔑 Estructura del JWT Token

El token JWT contiene el siguiente payload:

```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@example.com",
  "rol": "EMPLEADO",
  "nombre": "Juan Pérez",
  "iat": 1234567890,
  "exp": 1234567890
}
```

- `sub`: ID del usuario
- `email`: Email del usuario
- `rol`: Rol del usuario (EMPLEADO, RRHH, ADMIN)
- `nombre`: Nombre completo
- `iat`: Timestamp de emisión
- `exp`: Timestamp de expiración (7 días)

---

## ⚠️ Manejo de Errores

### 401 Unauthorized
Token no proporcionado, inválido o expirado
```json
{
  "statusCode": 401,
  "message": "Token inválido o expirado"
}
```

### 403 Forbidden
Usuario autenticado pero sin permisos para el rol
```json
{
  "statusCode": 403,
  "message": "Acceso denegado. Requiere uno de los siguientes roles: ADMIN, RRHH"
}
```

---

## 🧪 Testing

### Obtener token de prueba
1. Registrar usuario de prueba:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@test.com",
    "password": "password123",
    "rol": "EMPLEADO"
  }'
```

2. Copiar el `access_token` de la respuesta

3. Usar en requests protegidos:
```bash
export TOKEN="tu-token-aqui"

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notas Importantes

1. ✅ **AuthGuard está aplicado globalmente** - Todos los endpoints requieren autenticación por defecto
2. ✅ **Usa @Public()** para endpoints sin autenticación
3. ✅ **JWT expira en 7 días** - Configurable en `auth.module.ts`
4. ✅ **Passwords encriptados con bcrypt** (10 salt rounds)
5. ✅ **CORS habilitado** para http://localhost:4200 (configurable en .env)
6. ✅ **Validación automática** de DTOs con class-validator
7. ✅ **Frontend consciente del rol** - El token contiene toda la info del usuario

---

## 🔧 Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
JWT_SECRET=tu-secret-super-seguro-aqui
FRONTEND_URL=http://localhost:4200
```
