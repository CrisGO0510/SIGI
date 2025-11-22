# 📦 Repositorios en SIGI

Los repositorios son la capa de acceso a datos del sistema. Todos los repositorios extienden de `BaseRepository` que proporciona operaciones CRUD estándar usando Supabase.

## 🏗️ Estructura

```
src/
├── common/
│   └── repositories/
│       ├── base.repository.ts    # Repositorio base genérico
│       └── index.ts
└── modules/
    └── <modulo>/
        └── repositories/
            └── <entidad>.repository.ts
```

## 🎯 BaseRepository

### Métodos Disponibles

#### Crear
- `create(data: Partial<T>): Promise<T>` - Crear un registro
- `createMany(data: Partial<T>[]): Promise<T[]>` - Crear múltiples registros

#### Leer
- `findById(id: string): Promise<T | null>` - Buscar por ID
- `findOne(filters: Partial<T>): Promise<T | null>` - Buscar un registro con filtros
- `findAll(orderBy?: OrderOptions): Promise<T[]>` - Obtener todos los registros
- `findMany(filters: Partial<T>, orderBy?: OrderOptions): Promise<T[]>` - Buscar con filtros
- `findPaginated(options, filters?, orderBy?): Promise<PaginatedResult<T>>` - Buscar con paginación

#### Actualizar
- `update(id: string, data: Partial<T>): Promise<T>` - Actualizar por ID
- `updateMany(filters: Partial<T>, data: Partial<T>): Promise<T[]>` - Actualizar múltiples

#### Eliminar
- `delete(id: string): Promise<boolean>` - Eliminar por ID
- `deleteMany(filters: Partial<T>): Promise<boolean>` - Eliminar múltiples

#### Utilidades
- `count(filters?: Partial<T>): Promise<number>` - Contar registros
- `exists(filters: Partial<T>): Promise<boolean>` - Verificar existencia

## 📝 Cómo Crear un Repositorio

### 1. Crear el archivo del repositorio

```typescript
// src/modules/<modulo>/repositories/<entidad>.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';
import { MiEntidad } from '../../../database/entities';

@Injectable()
export class MiEntidadRepository extends BaseRepository<MiEntidad> {
  protected readonly tableName = 'mi_tabla'; // Nombre de la tabla en Supabase

  constructor(supabaseClientService: SupabaseClientService) {
    super(supabaseClientService);
  }

  // Métodos personalizados específicos del dominio
  async findByCustomField(value: string): Promise<MiEntidad[]> {
    return this.findMany({ custom_field: value } as any);
  }
}
```

### 2. Registrar en el módulo

```typescript
// src/modules/<modulo>/<modulo>.module.ts
import { Module } from '@nestjs/common';
import { MiEntidadRepository } from './repositories/mi-entidad.repository';

@Module({
  providers: [MiEntidadRepository],
  exports: [MiEntidadRepository], // Exportar si otros módulos lo necesitan
})
export class MiModuloModule {}
```

### 3. Usar en un servicio

```typescript
// src/modules/<modulo>/services/mi-servicio.service.ts
import { Injectable } from '@nestjs/common';
import { MiEntidadRepository } from '../repositories/mi-entidad.repository';

@Injectable()
export class MiServicioService {
  constructor(private readonly repository: MiEntidadRepository) {}

  async crear(data: any) {
    return this.repository.create(data);
  }

  async obtenerTodos() {
    return this.repository.findAll({ column: 'created_at', ascending: false });
  }

  async obtenerPorId(id: string) {
    const entidad = await this.repository.findById(id);
    if (!entidad) {
      throw new Error('No encontrado');
    }
    return entidad;
  }
}
```

## 💡 Ejemplos de Uso

### Ejemplo 1: CRUD Básico

```typescript
// Crear
const nuevoUsuario = await userRepository.create({
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  password_encrypted: hashedPassword,
  rol: 'EMPLEADO',
});

// Leer
const usuario = await userRepository.findById(id);
const usuarioPorEmail = await userRepository.findByEmail('juan@example.com');

// Actualizar
const actualizado = await userRepository.update(id, {
  telefono: '+57 300 123 4567',
});

// Eliminar
await userRepository.delete(id);
```

### Ejemplo 2: Búsquedas con Filtros

```typescript
// Buscar todos los usuarios RRHH
const rrhh = await userRepository.findMany({ rol: 'RRHH' } as any);

// Buscar con ordenamiento
const usuarios = await userRepository.findAll({
  column: 'nombre',
  ascending: true,
});

// Verificar existencia
const existe = await userRepository.exists({ email: 'test@example.com' } as any);
```

### Ejemplo 3: Paginación

```typescript
const resultado = await userRepository.findPaginated(
  { page: 1, limit: 10 },
  { rol: 'EMPLEADO' } as any,
  { column: 'created_at', ascending: false },
);

console.log(resultado.data); // Array de usuarios
console.log(resultado.total); // Total de registros
console.log(resultado.totalPages); // Total de páginas
```

### Ejemplo 4: Operaciones en Lote

```typescript
// Crear múltiples
const usuarios = await userRepository.createMany([
  { nombre: 'User 1', email: 'user1@example.com', ... },
  { nombre: 'User 2', email: 'user2@example.com', ... },
]);

// Actualizar múltiples
await userRepository.updateMany(
  { rol: 'EMPLEADO' } as any,
  { telefono: 'N/A' } as any,
);

// Eliminar múltiples
await userRepository.deleteMany({ rol: 'TEMPORAL' } as any);
```

## 🔐 Seguridad (RLS)

Los repositorios respetan las políticas de Row Level Security (RLS) configuradas en Supabase. Asegúrate de:

1. Pasar el `auth.uid()` correcto en las operaciones
2. Validar permisos en la capa de servicio
3. Usar el Service Role Key solo cuando sea necesario

## ⚠️ Mejores Prácticas

1. **Un repositorio por entidad**: No mezclar lógica de múltiples tablas
2. **Métodos de dominio**: Añade métodos específicos del negocio (ej: `findByEmail`)
3. **Manejo de errores**: El repositorio lanza errores, captúralos en los servicios
4. **No lógica de negocio**: Los repositorios solo acceden a datos, la lógica va en servicios
5. **TypeScript strict**: Usa tipos correctos para aprovechar el autocompletado

## 🚀 Siguiente Paso

Una vez creado tu repositorio, implementa:
1. **DTOs** para validación de entrada/salida
2. **Mappers** para transformar entidades ↔ DTOs
3. **Servicios** con lógica de negocio
4. **Controllers** para exponer endpoints HTTP

Ver ejemplo completo en `src/modules/users/`
