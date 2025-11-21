import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';
import { Pago, EstadoPago } from '../../../database/entities';

/**
 * PagoRepository - Repositorio para la entidad Pago
 * 
 * Gestiona el acceso a datos de pagos asociados a incapacidades.
 */
@Injectable()
export class PagoRepository extends BaseRepository<Pago> {
  protected readonly tableName = 'pagos';

  constructor(supabaseClientService: SupabaseClientService) {
    super(supabaseClientService);
  }

  /**
   * Buscar pago por incapacidad
   */
  async findByIncapacidad(incapacidadId: string): Promise<Pago | null> {
    return this.findOne({ incapacidad_id: incapacidadId } as Partial<Record<keyof Pago, any>>);
  }

  /**
   * Buscar pagos por usuario
   */
  async findByUsuario(usuarioId: string): Promise<Pago[]> {
    return this.findMany(
      { usuario_id: usuarioId } as Partial<Record<keyof Pago, any>>,
      { column: 'fecha_pago', ascending: false },
    );
  }

  /**
   * Buscar pagos por empresa
   */
  async findByEmpresa(empresaId: string): Promise<Pago[]> {
    return this.findMany(
      { empresa_id: empresaId } as Partial<Record<keyof Pago, any>>,
      { column: 'fecha_pago', ascending: false },
    );
  }

  /**
   * Buscar pagos por estado
   */
  async findByEstado(estado: EstadoPago): Promise<Pago[]> {
    return this.findMany(
      { estado_pago: estado } as Partial<Record<keyof Pago, any>>,
      { column: 'created_at', ascending: false },
    );
  }

  /**
   * Buscar pagos pendientes
   */
  async findPendientes(): Promise<Pago[]> {
    return this.findByEstado(EstadoPago.PENDIENTE);
  }

  /**
   * Buscar pagos completados
   */
  async findCompletados(): Promise<Pago[]> {
    return this.findByEstado(EstadoPago.COMPLETADO);
  }

  /**
   * Buscar pagos fallidos
   */
  async findFallidos(): Promise<Pago[]> {
    return this.findByEstado(EstadoPago.FALLIDO);
  }

  /**
   * Marcar pago como completado
   */
  async marcarComoCompletado(id: string, referencia: string): Promise<Pago> {
    return this.update(id, {
      estado_pago: EstadoPago.COMPLETADO,
      fecha_pago: new Date(),
      referencia,
    } as Partial<Pago>);
  }

  /**
   * Marcar pago como fallido
   */
  async marcarComoFallido(id: string, referencia: string): Promise<Pago> {
    return this.update(id, {
      estado_pago: EstadoPago.FALLIDO,
      referencia,
    } as Partial<Pago>);
  }

  /**
   * Obtener monto total pendiente de pago
   */
  async getTotalPendiente(): Promise<number> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('monto')
      .eq('estado_pago', EstadoPago.PENDIENTE);

    if (error) {
      throw new Error(`Error calculating total pendiente: ${error.message}`);
    }

    return (data || []).reduce((sum, pago) => sum + (pago.monto || 0), 0);
  }

  /**
   * Obtener monto total pagado en un rango de fechas
   */
  async getTotalPagadoByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('monto')
      .eq('estado_pago', EstadoPago.COMPLETADO)
      .gte('fecha_pago', startDate.toISOString())
      .lte('fecha_pago', endDate.toISOString());

    if (error) {
      throw new Error(`Error calculating total pagado: ${error.message}`);
    }

    return (data || []).reduce((sum, pago) => sum + (pago.monto || 0), 0);
  }

  /**
   * Buscar pagos por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Pago[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gte('fecha_pago', startDate.toISOString())
      .lte('fecha_pago', endDate.toISOString())
      .order('fecha_pago', { ascending: false });

    if (error) {
      throw new Error(`Error finding pagos by date range: ${error.message}`);
    }

    return (data as Pago[]) || [];
  }
}
