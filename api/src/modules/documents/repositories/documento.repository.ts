import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';
import { Documento } from '../../../database/entities';

/**
 * DocumentoRepository - Repositorio para la entidad Documento
 * 
 * Gestiona el acceso a datos de documentos adjuntos a incapacidades.
 */
@Injectable()
export class DocumentoRepository extends BaseRepository<Documento> {
  protected readonly tableName = 'documentos';

  constructor(supabaseClientService: SupabaseClientService) {
    super(supabaseClientService);
  }

  /**
   * Buscar documentos de una incapacidad
   */
  async findByIncapacidad(incapacidadId: string): Promise<Documento[]> {
    return this.findMany(
      { incapacidad_id: incapacidadId } as Partial<Record<keyof Documento, any>>,
      { column: 'fecha_subida', ascending: false },
    );
  }

  /**
   * Buscar documentos no validados
   */
  async findNoValidados(): Promise<Documento[]> {
    return this.findMany(
      { validado: false } as Partial<Record<keyof Documento, any>>,
      { column: 'fecha_subida', ascending: true },
    );
  }

  /**
   * Buscar documentos validados
   */
  async findValidados(): Promise<Documento[]> {
    return this.findMany(
      { validado: true } as Partial<Record<keyof Documento, any>>,
      { column: 'fecha_subida', ascending: false },
    );
  }

  /**
   * Marcar documento como validado
   */
  async marcarComoValidado(id: string, detalleValidacion: string): Promise<Documento> {
    return this.update(id, {
      validado: true,
      detalle_validacion: detalleValidacion,
    } as Partial<Documento>);
  }

  /**
   * Rechazar documento
   */
  async rechazarDocumento(id: string, motivo: string): Promise<Documento> {
    return this.update(id, {
      validado: false,
      detalle_validacion: `RECHAZADO: ${motivo}`,
    } as Partial<Documento>);
  }

  /**
   * Buscar documentos por hash (para detectar duplicados)
   */
  async findByHash(hash: string): Promise<Documento[]> {
    return this.findMany({ hash } as Partial<Record<keyof Documento, any>>);
  }

  /**
   * Buscar documentos por formato
   */
  async findByFormato(formato: string): Promise<Documento[]> {
    return this.findMany(
      { formato } as Partial<Record<keyof Documento, any>>,
      { column: 'fecha_subida', ascending: false },
    );
  }

  /**
   * Obtener tamaño total de documentos de una incapacidad
   */
  async getTotalSizeByIncapacidad(incapacidadId: string): Promise<number> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('tamano_bytes')
      .eq('incapacidad_id', incapacidadId);

    if (error) {
      throw new Error(`Error calculating total size: ${error.message}`);
    }

    return (data || []).reduce((sum, doc) => sum + (doc.tamano_bytes || 0), 0);
  }

  /**
   * Contar documentos de una incapacidad
   */
  async countByIncapacidad(incapacidadId: string): Promise<number> {
    return this.count({ incapacidad_id: incapacidadId } as Partial<Record<keyof Documento, any>>);
  }

  /**
   * Eliminar documentos de una incapacidad
   */
  async deleteByIncapacidad(incapacidadId: string): Promise<boolean> {
    return this.deleteMany({ incapacidad_id: incapacidadId } as Partial<Record<keyof Documento, any>>);
  }
}
