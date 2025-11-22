import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Reporte, FormatoReporte } from '../../../database/entities';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';

@Injectable()
export class ReporteRepository extends BaseRepository<Reporte> {
  protected tableName = 'reportes';

  constructor(supabaseClient: SupabaseClientService) {
    super(supabaseClient);
  }

  /**
   * Buscar reportes generados por un usuario específico
   */
  async findByGeneradoPor(usuarioId: string): Promise<Reporte[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('generado_por', usuarioId)
      .order('fecha_generacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar reportes destinados a una empresa específica
   */
  async findByEmpresa(empresaId: string): Promise<Reporte[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('empresa_id', empresaId)
      .order('fecha_generacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar reportes generados en un rango de fechas
   */
  async findByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Reporte[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gte('fecha_generacion', fechaInicio.toISOString())
      .lte('fecha_generacion', fechaFin.toISOString())
      .order('fecha_generacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar reportes por formato
   */
  async findByFormato(formato: FormatoReporte): Promise<Reporte[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('formato', formato)
      .order('fecha_generacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar reportes recientes (últimos N días)
   */
  async findRecientes(dias: number = 30): Promise<Reporte[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gte('fecha_generacion', fechaLimite.toISOString())
      .order('fecha_generacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Contar reportes por formato
   */
  async countByFormato(formato: FormatoReporte): Promise<number> {
    const { count, error } = await this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('formato', formato);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Buscar reportes por empresa y rango de fechas
   */
  async findByEmpresaAndDateRange(
    empresaId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Reporte[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('empresa_id', empresaId)
      .gte('fecha_generacion', fechaInicio.toISOString())
      .lte('fecha_generacion', fechaFin.toISOString())
      .order('fecha_generacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener tamaño total de archivos de reportes por empresa
   */
  async getTotalSizeByEmpresa(empresaId: string): Promise<number> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('tamano_archivo')
      .eq('empresa_id', empresaId);

    if (error) throw error;
    
    return (data || []).reduce((total, reporte) => total + (reporte.tamano_archivo || 0), 0);
  }

  /**
   * Eliminar reportes antiguos (más de N días)
   */
  async deleteAntiguos(dias: number = 90): Promise<number> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const { data, error } = await this.client
      .from(this.tableName)
      .delete()
      .lt('fecha_generacion', fechaLimite.toISOString())
      .select();

    if (error) throw error;
    return data?.length || 0;
  }
}
