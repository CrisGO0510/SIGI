import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';
import { Incapacidad, EstadoIncapacidad } from '../../../database/entities';

/**
 * IncapacidadRepository - Repositorio para la entidad Incapacidad
 * 
 * Gestiona el acceso a datos de incapacidades médicas y licencias.
 */
@Injectable()
export class IncapacidadRepository extends BaseRepository<Incapacidad> {
  protected readonly tableName = 'incapacidades';

  constructor(supabaseClientService: SupabaseClientService) {
    super(supabaseClientService);
  }

  /**
   * Buscar incapacidades de un usuario
   */
  async findByUsuario(usuarioId: string): Promise<Incapacidad[]> {
    return this.findMany(
      { usuario_id: usuarioId } as Partial<Record<keyof Incapacidad, any>>,
      { column: 'fecha_registro', ascending: false },
    );
  }

  /**
   * Buscar incapacidades por estado
   */
  async findByEstado(estado: EstadoIncapacidad): Promise<Incapacidad[]> {
    return this.findMany(
      { estado } as Partial<Record<keyof Incapacidad, any>>,
      { column: 'fecha_registro', ascending: false },
    );
  }

  /**
   * Buscar incapacidades pendientes de revisión
   */
  async findPendientesRevision(): Promise<Incapacidad[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .in('estado', ['PENDIENTE_REVISION', 'EN_REVISION'])
      .order('fecha_registro', { ascending: true });

    if (error) {
      throw new Error(`Error finding pending incapacidades: ${error.message}`);
    }

    return (data as Incapacidad[]) || [];
  }

  /**
   * Buscar incapacidades por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Incapacidad[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gte('fecha_inicio', startDate.toISOString())
      .lte('fecha_fin', endDate.toISOString())
      .order('fecha_inicio', { ascending: false });

    if (error) {
      throw new Error(`Error finding incapacidades by date range: ${error.message}`);
    }

    return (data as Incapacidad[]) || [];
  }

  /**
   * Cambiar estado de una incapacidad
   */
  async cambiarEstado(id: string, nuevoEstado: EstadoIncapacidad, observaciones?: string): Promise<Incapacidad> {
    const updateData: Partial<Incapacidad> = { estado: nuevoEstado };
    if (observaciones) {
      updateData.observaciones = observaciones;
    }
    return this.update(id, updateData);
  }

  /**
   * Obtener incapacidades con monto total por usuario
   */
  async getTotalMontoByUsuario(usuarioId: string): Promise<number> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('monto_solicitado')
      .eq('usuario_id', usuarioId);

    if (error) {
      throw new Error(`Error calculating total monto: ${error.message}`);
    }

    return (data || []).reduce((sum, inc) => sum + (inc.monto_solicitado || 0), 0);
  }

  /**
   * Buscar incapacidades recientes (últimos N días)
   */
  async findRecent(days: number = 30): Promise<Incapacidad[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gte('fecha_registro', startDate.toISOString())
      .order('fecha_registro', { ascending: false });

    if (error) {
      throw new Error(`Error finding recent incapacidades: ${error.message}`);
    }

    return (data as Incapacidad[]) || [];
  }
}
