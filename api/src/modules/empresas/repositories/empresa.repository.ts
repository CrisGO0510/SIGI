import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories';
import { Empresa } from '../../../database/entities';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';

@Injectable()
export class EmpresaRepository extends BaseRepository<Empresa> {
  protected readonly tableName = 'empresas';

  constructor(supabaseClientService: SupabaseClientService) {
    super(supabaseClientService);
  }

  /**
   * Buscar empresa por nombre
   */
  async findByNombre(nombre: string): Promise<Empresa | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('nombre', nombre)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  /**
   * Buscar empresa por correo
   */
  async findByCorreo(correo: string): Promise<Empresa | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('correo_contacto', correo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  /**
   * Obtener usuarios de una empresa
   */
  async getUsuarios(empresaId: string): Promise<any[]> {
    const { data, error } = await this.client
      .from('usuarios')
      .select('id, nombre, email, rol, telefono, created_at')
      .eq('empresa_id', empresaId);

    if (error) throw error;

    return data || [];
  }
}
