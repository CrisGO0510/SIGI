import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientService } from '../../infraestructure/external-apis/supabase';

/**
 * Opciones de paginación para consultas
 */
export interface PaginationOptions {
  page?: number; // Página actual (empieza en 1)
  limit?: number; // Cantidad de registros por página
}

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Opciones de ordenamiento
 */
export interface OrderOptions {
  column: string;
  ascending?: boolean;
}

/**
 * BaseRepository - Repositorio genérico para operaciones CRUD con Supabase
 * 
 * Todos los repositorios del sistema deben extender esta clase.
 * Proporciona métodos estándar para:
 * - Crear (create)
 * - Leer (findAll, findById, findOne, findMany)
 * - Actualizar (update)
 * - Eliminar (delete)
 * - Paginación
 * - Conteo
 */
@Injectable()
export abstract class BaseRepository<T> {
  protected readonly client: SupabaseClient;
  protected abstract readonly tableName: string;

  constructor(protected readonly supabaseClientService: SupabaseClientService) {
    this.client = supabaseClientService.getClient();
  }

  /**
   * Obtener el nombre de la tabla (para uso en clases hijas)
   */
  protected getTableName(): string {
    return this.tableName;
  }

  /**
   * Crear un nuevo registro
   */
  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating record in ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  /**
   * Crear múltiples registros
   */
  async createMany(data: Partial<T>[]): Promise<T[]> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert(data)
      .select();

    if (error) {
      throw new Error(`Error creating records in ${this.tableName}: ${error.message}`);
    }

    return result as T[];
  }

  /**
   * Buscar un registro por ID
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el registro
        return null;
      }
      throw new Error(`Error finding record by id in ${this.tableName}: ${error.message}`);
    }

    return data as T;
  }

  /**
   * Buscar un registro con condiciones personalizadas
   */
  async findOne(filters: Partial<Record<keyof T, any>>): Promise<T | null> {
    let query = this.client.from(this.tableName).select('*');

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Error finding record in ${this.tableName}: ${error.message}`);
    }

    return data as T | null;
  }

  /**
   * Buscar todos los registros
   */
  async findAll(orderBy?: OrderOptions): Promise<T[]> {
    let query = this.client.from(this.tableName).select('*');

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding all records in ${this.tableName}: ${error.message}`);
    }

    return (data as T[]) || [];
  }

  /**
   * Buscar múltiples registros con filtros
   */
  async findMany(
    filters: Partial<Record<keyof T, any>>,
    orderBy?: OrderOptions,
  ): Promise<T[]> {
    let query = this.client.from(this.tableName).select('*');

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding records in ${this.tableName}: ${error.message}`);
    }

    return (data as T[]) || [];
  }

  /**
   * Buscar registros con paginación
   */
  async findPaginated(
    options: PaginationOptions = {},
    filters?: Partial<Record<keyof T, any>>,
    orderBy?: OrderOptions,
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.client.from(this.tableName).select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error finding paginated records in ${this.tableName}: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data as T[]) || [],
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Actualizar un registro por ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating record in ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  /**
   * Actualizar múltiples registros con filtros
   */
  async updateMany(
    filters: Partial<Record<keyof T, any>>,
    data: Partial<T>,
  ): Promise<T[]> {
    let query = this.client.from(this.tableName).update(data);

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();

    if (error) {
      throw new Error(`Error updating records in ${this.tableName}: ${error.message}`);
    }

    return (result as T[]) || [];
  }

  /**
   * Eliminar un registro por ID
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting record in ${this.tableName}: ${error.message}`);
    }

    return true;
  }

  /**
   * Eliminar múltiples registros con filtros
   */
  async deleteMany(filters: Partial<Record<keyof T, any>>): Promise<boolean> {
    let query = this.client.from(this.tableName).delete();

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error } = await query;

    if (error) {
      throw new Error(`Error deleting records in ${this.tableName}: ${error.message}`);
    }

    return true;
  }

  /**
   * Contar registros
   */
  async count(filters?: Partial<Record<keyof T, any>>): Promise<number> {
    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error counting records in ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Verificar si existe un registro
   */
  async exists(filters: Partial<Record<keyof T, any>>): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }
}
