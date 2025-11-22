import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DocumentoRepository } from '../repositories/documento.repository';
import { SupabaseStorageService } from '../../../infraestructure/file-storage/supabase-storage.service';
import { UploadDocumentoDto } from '../dtos/upload-documento.dto';
import { Documento } from '../../../database/entities/documento.entity';
import { FormatoReporte } from '../../../database/entities/enums';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly documentoRepository: DocumentoRepository,
    private readonly storageService: SupabaseStorageService,
  ) {}

  /**
   * Sube un documento asociado a una incapacidad
   */
  async uploadDocumento(
    dto: UploadDocumentoDto,
    file: Express.Multer.File,
    usuarioId: string,
  ): Promise<Documento> {
    try {
      this.logger.log(
        `Subiendo documento tipo ${dto.tipoDocumento} para incapacidad ${dto.incapacidadId}`,
      );

      // 1. Subir archivo a Supabase Storage
      const uploadResult = await this.storageService.uploadFile(
        file,
        'incapacidades',
      );

      // 2. Crear registro en la base de datos
      const documento = await this.documentoRepository.create({
        incapacidad_id: dto.incapacidadId,
        nombre_archivo: file.originalname,
        formato: file.mimetype.includes('pdf') ? FormatoReporte.PDF : FormatoReporte.CSV,
        tamano_bytes: file.size,
        hash: '', // Se puede calcular un hash MD5 o SHA256 si es necesario
        storage_path: uploadResult.path,
        fecha_subida: new Date(),
        validado: false,
        detalle_validacion: dto.descripcion,
      });

      this.logger.log(`Documento creado exitosamente: ${documento.id}`);

      // 3. Agregar URL pública al documento
      return this.addPublicUrl(documento);
    } catch (error) {
      this.logger.error(`Error subiendo documento: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene todos los documentos de una incapacidad
   */
  async getDocumentosByIncapacidad(
    incapacidadId: string,
  ): Promise<any[]> {
    const documentos = await this.documentoRepository.findByIncapacidad(incapacidadId);
    return documentos.map(doc => this.addPublicUrl(doc));
  }

  /**
   * Obtiene un documento por ID
   */
  async getDocumentoById(id: string): Promise<any> {
    const documento = await this.documentoRepository.findById(id);
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    return this.addPublicUrl(documento);
  }

  /**
   * Elimina un documento (tanto del storage como de la BD)
   */
  async deleteDocumento(id: string): Promise<void> {
    const documento = await this.getDocumentoById(id);

    try {
      // 1. Eliminar archivo del storage
      if (documento.storage_path) {
        await this.storageService.deleteFile(documento.storage_path);
      }

      // 2. Eliminar registro de la BD
      await this.documentoRepository.delete(id);

      this.logger.log(`Documento ${id} eliminado exitosamente`);
    } catch (error) {
      this.logger.error(`Error eliminando documento: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene documentos por formato
   */
  async getDocumentosByFormato(formato: FormatoReporte): Promise<any[]> {
    const documentos = await this.documentoRepository.findByFormato(formato);
    return documentos.map(doc => this.addPublicUrl(doc));
  }

  /**
   * Agrega la URL pública al documento
   */
  private addPublicUrl(documento: Documento): any {
    return {
      ...documento,
      url_publica: documento.storage_path
        ? this.storageService.getPublicUrl(documento.storage_path)
        : null,
    };
  }
}
