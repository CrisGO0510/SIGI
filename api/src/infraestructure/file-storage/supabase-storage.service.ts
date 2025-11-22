import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClientService } from '../external-apis/supabase/supabase.service';

export interface UploadFileResult {
  path: string;
  url: string;
  fullPath: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly bucketName = 'documentos'; // Nombre del bucket en Supabase

  constructor(private readonly supabaseClient: SupabaseClientService) {}

  /**
   * Sube un archivo al bucket de Supabase
   * @param file - Archivo a subir (de multer)
   * @param folder - Carpeta dentro del bucket (ej: 'incapacidades', 'soportes')
   * @returns Información del archivo subido (path, url)
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadFileResult> {
    try {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      this.logger.log(`Subiendo archivo: ${filePath}`);

      // Subir archivo a Supabase Storage
      const { data, error } = await this.supabaseClient.getClient().storage
        .from(this.bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Error al subir archivo: ${error.message}`);
        throw new Error(`Error al subir archivo: ${error.message}`);
      }

      // Obtener URL pública del archivo
      const { data: urlData } = this.supabaseClient.getClient().storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      this.logger.log(`Archivo subido exitosamente: ${urlData.publicUrl}`);

      return {
        path: filePath,
        url: urlData.publicUrl,
        fullPath: data.path,
      };
    } catch (error) {
      this.logger.error(`Error en uploadFile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un archivo del bucket de Supabase
   * @param filePath - Path del archivo en el bucket
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      this.logger.log(`Eliminando archivo: ${filePath}`);

      const { error } = await this.supabaseClient.getClient().storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        this.logger.error(`Error al eliminar archivo: ${error.message}`);
        throw new Error(`Error al eliminar archivo: ${error.message}`);
      }

      this.logger.log(`Archivo eliminado exitosamente: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error en deleteFile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   * @param filePath - Path del archivo en el bucket
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabaseClient.getClient().storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Verifica si un archivo existe en el bucket
   * @param filePath - Path del archivo a verificar
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseClient.getClient().storage
        .from(this.bucketName)
        .list(filePath.split('/')[0], {
          search: filePath.split('/').pop(),
        });

      if (error) {
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      this.logger.error(`Error verificando existencia de archivo: ${error.message}`);
      return false;
    }
  }
}
