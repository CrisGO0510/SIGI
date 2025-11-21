import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Empresa } from '../../../database/entities';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';

@Injectable()
export class EmpresaRepository extends BaseRepository<Empresa> {
  protected tableName = 'empresas';

  constructor(supabaseClient: SupabaseClientService) {
    super(supabaseClient);
  }

  /**
   * Buscar empresa por nombre
   */
  async findByNombre(nombre: string): Promise<Empresa | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .ilike('nombre', `%${nombre}%`)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar empresa por correo de contacto
   */
  async findByCorreo(correo: string): Promise<Empresa | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('correo_contacto', correo)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar empresa por NIT
   */
  async findByNit(nit: string): Promise<Empresa | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('nit', nit)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Verificar si existe una empresa por NIT
   */
  async existsByNit(nit: string): Promise<boolean> {
    const empresa = await this.findByNit(nit);
    return empresa !== null;
  }

  /**
   * Buscar empresas activas
   */
  async findActivas(): Promise<Empresa[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('activa', true)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Cambiar estado de empresa (activar/desactivar)
   */
  async cambiarEstadoActivo(id: string, activa: boolean): Promise<Empresa> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({ activa, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar empresas con búsqueda parcial (nombre, NIT o correo)
   */
  async search(searchTerm: string): Promise<Empresa[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .or(`nombre.ilike.%${searchTerm}%,nit.ilike.%${searchTerm}%,correo_contacto.ilike.%${searchTerm}%`)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
