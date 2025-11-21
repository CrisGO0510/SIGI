import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';
import { Usuario } from '../../../database/entities';

/**
 * UserRepository - Repositorio para la entidad Usuario
 * 
 * Extiende BaseRepository para heredar operaciones CRUD estándar.
 * Añade métodos específicos para el dominio de usuarios.
 */
@Injectable()
export class UserRepository extends BaseRepository<Usuario> {
  protected readonly tableName = 'usuarios';

  constructor(supabaseClientService: SupabaseClientService) {
    super(supabaseClientService);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.findOne({ email } as Partial<Record<keyof Usuario, any>>);
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(rol: string): Promise<Usuario[]> {
    return this.findMany({ rol } as Partial<Record<keyof Usuario, any>>);
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(id: string): Promise<Usuario> {
    return this.update(id, { last_login: new Date() } as Partial<Usuario>);
  }

  /**
   * Verificar si existe un usuario con el email
   */
  async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email } as Partial<Record<keyof Usuario, any>>);
  }

  /**
   * Obtener usuarios RRHH
   */
  async findRRHHUsers(): Promise<Usuario[]> {
    return this.findByRole('RRHH');
  }

  /**
   * Obtener usuarios administradores
   */
  async findAdminUsers(): Promise<Usuario[]> {
    return this.findByRole('ADMIN');
  }

  /**
   * Buscar usuarios por nombre (búsqueda parcial)
   */
  async searchByName(searchTerm: string): Promise<Usuario[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .ilike('nombre', `%${searchTerm}%`)
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(`Error searching users by name: ${error.message}`);
    }

    return (data as Usuario[]) || [];
  }
}
