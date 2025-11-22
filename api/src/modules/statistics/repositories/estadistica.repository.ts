import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Estadistica } from '../../../database/entities';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';

@Injectable()
export class EstadisticaRepository extends BaseRepository<Estadistica> {
  protected tableName = 'estadisticas';

  constructor(supabaseClient: SupabaseClientService) {
    super(supabaseClient);
  }

  /**
   * Buscar estadísticas por empresa
   */
  async findByEmpresa(empresaId: string): Promise<Estadistica[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('empresa_id', empresaId)
      .order('fecha_calculada', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar estadísticas en un rango de fechas
   */
  async findByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Estadistica[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gte('fecha_calculada', fechaInicio.toISOString())
      .lte('fecha_calculada', fechaFin.toISOString())
      .order('fecha_calculada', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar estadísticas recientes (últimos N días)
   */
  async findRecientes(dias: number = 30): Promise<Estadistica[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gte('fecha_calculada', fechaLimite.toISOString())
      .order('fecha_calculada', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener última estadística calculada para una empresa
   */
  async findUltimaByEmpresa(empresaId: string): Promise<Estadistica | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('empresa_id', empresaId)
      .order('fecha_calculada', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  /**
   * Buscar estadísticas por empresa y rango de fechas
   */
  async findByEmpresaAndDateRange(
    empresaId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Estadistica[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('empresa_id', empresaId)
      .gte('fecha_calculada', fechaInicio.toISOString())
      .lte('fecha_calculada', fechaFin.toISOString())
      .order('fecha_calculada', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Calcular promedio de días de incapacidad por empresa
   */
  async getPromedioDiasIncapacidad(empresaId: string): Promise<number> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('total_dias_incapacidad, total_incapacidades')
      .eq('empresa_id', empresaId)
      .order('fecha_calculada', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data || data.total_incapacidades === 0) return 0;
    
    return data.total_dias_incapacidad / data.total_incapacidades;
  }

  /**
   * Obtener tendencia de incapacidades (últimos N meses)
   */
  async getTendenciaIncapacidades(empresaId: string, meses: number = 6): Promise<Estadistica[]> {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - meses);

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('empresa_id', empresaId)
      .gte('fecha_calculada', fechaLimite.toISOString())
      .order('fecha_calculada', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Crear o actualizar estadística para una empresa
   * (útil para cálculos diarios/semanales automatizados)
   */
  async upsertByEmpresa(estadistica: Partial<Estadistica>): Promise<Estadistica> {
    const { data, error } = await this.client
      .from(this.tableName)
      .upsert(
        {
          ...estadistica,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'empresa_id,fecha_calculada' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Eliminar estadísticas antiguas (más de N días)
   */
  async deleteAntiguas(dias: number = 365): Promise<number> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const { data, error } = await this.client
      .from(this.tableName)
      .delete()
      .lt('fecha_calculada', fechaLimite.toISOString())
      .select();

    if (error) throw error;
    return data?.length || 0;
  }
}
