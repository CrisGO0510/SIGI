import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';
import { Notificacion, TipoNotificacion } from '../../../database/entities';

/**
 * NotificacionRepository - Repositorio para la entidad Notificacion
 * 
 * Gestiona el acceso a datos de notificaciones enviadas por email o SMS.
 */
@Injectable()
export class NotificacionRepository extends BaseRepository<Notificacion> {
  protected readonly tableName = 'notificaciones';

  constructor(supabaseClientService: SupabaseClientService) {
    super(supabaseClientService);
  }

  /**
   * Buscar notificaciones de un usuario
   */
  async findByUsuario(usuarioId: string): Promise<Notificacion[]> {
    return this.findMany(
      { usuario_id: usuarioId } as Partial<Record<keyof Notificacion, any>>,
      { column: 'created_at', ascending: false },
    );
  }

  /**
   * Buscar notificaciones de una empresa
   */
  async findByEmpresa(empresaId: string): Promise<Notificacion[]> {
    return this.findMany(
      { empresa_id: empresaId } as Partial<Record<keyof Notificacion, any>>,
      { column: 'created_at', ascending: false },
    );
  }

  /**
   * Buscar notificaciones de una incapacidad
   */
  async findByIncapacidad(incapacidadId: string): Promise<Notificacion[]> {
    return this.findMany(
      { incapacidad_id: incapacidadId } as Partial<Record<keyof Notificacion, any>>,
      { column: 'created_at', ascending: false },
    );
  }

  /**
   * Buscar notificaciones por tipo
   */
  async findByTipo(tipo: TipoNotificacion): Promise<Notificacion[]> {
    return this.findMany(
      { tipo } as Partial<Record<keyof Notificacion, any>>,
      { column: 'created_at', ascending: false },
    );
  }

  /**
   * Buscar notificaciones pendientes de envío
   */
  async findPendientes(): Promise<Notificacion[]> {
    return this.findMany(
      { enviada: false } as Partial<Record<keyof Notificacion, any>>,
      { column: 'created_at', ascending: true },
    );
  }

  /**
   * Buscar notificaciones enviadas
   */
  async findEnviadas(): Promise<Notificacion[]> {
    return this.findMany(
      { enviada: true } as Partial<Record<keyof Notificacion, any>>,
      { column: 'fecha_envio', ascending: false },
    );
  }

  /**
   * Marcar notificación como enviada
   */
  async marcarComoEnviada(id: string): Promise<Notificacion> {
    return this.update(id, {
      enviada: true,
      fecha_envio: new Date(),
    } as Partial<Notificacion>);
  }

  /**
   * Marcar múltiples notificaciones como enviadas
   */
  async marcarVariasComoEnviadas(ids: string[]): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ enviada: true, fecha_envio: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      throw new Error(`Error marking notifications as sent: ${error.message}`);
    }
  }

  /**
   * Buscar notificaciones no enviadas más antiguas que X horas
   */
  async findPendientesAntiguas(horasAtras: number = 24): Promise<Notificacion[]> {
    const limitDate = new Date();
    limitDate.setHours(limitDate.getHours() - horasAtras);

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('enviada', false)
      .lt('created_at', limitDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error finding old pending notifications: ${error.message}`);
    }

    return (data as Notificacion[]) || [];
  }

  /**
   * Contar notificaciones no leídas por usuario (asumiendo que no enviada = no leída)
   */
  async countNoLeidasByUsuario(usuarioId: string): Promise<number> {
    return this.count({
      usuario_id: usuarioId,
      enviada: false,
    } as Partial<Record<keyof Notificacion, any>>);
  }

  /**
   * Eliminar notificaciones antiguas (más de X días)
   */
  async deleteAntiguas(diasAtras: number = 90): Promise<boolean> {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - diasAtras);

    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .lt('created_at', limitDate.toISOString());

    if (error) {
      throw new Error(`Error deleting old notifications: ${error.message}`);
    }

    return true;
  }
}
