import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ValidadorAutomatico } from '../../../database/entities';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';

@Injectable()
export class ValidadorAutomaticoRepository extends BaseRepository<ValidadorAutomatico> {
  protected tableName = 'validadores_automaticos';

  constructor(supabaseClient: SupabaseClientService) {
    super(supabaseClient);
  }

  /**
   * Buscar validadores por versión específica
   */
  async findByVersion(version: string): Promise<ValidadorAutomatico[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('version', version)
      .order('fecha_ejecucion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener la última versión del validador
   */
  async getLatestVersion(): Promise<string | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('version')
      .order('fecha_ejecucion', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.version || null;
  }

  /**
   * Buscar ejecuciones recientes del validador
   */
  async findRecientes(dias: number = 30): Promise<ValidadorAutomatico[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gte('fecha_ejecucion', fechaLimite.toISOString())
      .order('fecha_ejecucion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar validaciones por documento específico
   */
  async findByDocumento(documentoId: string): Promise<ValidadorAutomatico[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .contains('documentos_procesados', [documentoId])
      .order('fecha_ejecucion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar validaciones por incapacidad específica
   */
  async findByIncapacidad(incapacidadId: string): Promise<ValidadorAutomatico[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .contains('incapacidades_validadas', [incapacidadId])
      .order('fecha_ejecucion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener estadísticas de validación exitosa
   */
  async getEstadisticasValidacion(dias: number = 30): Promise<{
    totalEjecuciones: number;
    promedioDocumentosProcesados: number;
    promedioIncapacidadesValidadas: number;
    promedioErrores: number;
  }> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const { data, error } = await this.client
      .from(this.tableName)
      .select('documentos_procesados, incapacidades_validadas, errores_encontrados')
      .gte('fecha_ejecucion', fechaLimite.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        totalEjecuciones: 0,
        promedioDocumentosProcesados: 0,
        promedioIncapacidadesValidadas: 0,
        promedioErrores: 0,
      };
    }

    const totalDocs = data.reduce((sum, item) => sum + (item.documentos_procesados?.length || 0), 0);
    const totalIncap = data.reduce((sum, item) => sum + (item.incapacidades_validadas?.length || 0), 0);
    const totalErrores = data.reduce((sum, item) => sum + (item.errores_encontrados?.length || 0), 0);

    return {
      totalEjecuciones: data.length,
      promedioDocumentosProcesados: totalDocs / data.length,
      promedioIncapacidadesValidadas: totalIncap / data.length,
      promedioErrores: totalErrores / data.length,
    };
  }

  /**
   * Buscar validaciones con errores
   */
  async findConErrores(): Promise<ValidadorAutomatico[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .not('errores_encontrados', 'is', null)
      .order('fecha_ejecucion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener última ejecución del validador
   */
  async getUltimaEjecucion(): Promise<ValidadorAutomatico | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .order('fecha_ejecucion', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Eliminar registros antiguos de validación (más de N días)
   */
  async deleteAntiguos(dias: number = 90): Promise<number> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const { data, error } = await this.client
      .from(this.tableName)
      .delete()
      .lt('fecha_ejecucion', fechaLimite.toISOString())
      .select();

    if (error) throw error;
    return data?.length || 0;
  }
}
