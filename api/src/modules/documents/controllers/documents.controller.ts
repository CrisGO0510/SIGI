import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentsService } from '../services/documents.service';
import { UploadDocumentoDto } from '../dtos/upload-documento.dto';
import { CurrentUser } from '../../../common/decorators';
import { Documento } from '../../../database/entities/documento.entity';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir un documento asociado a una incapacidad',
    description: `
**Sube un archivo al bucket de Supabase y crea el registro en la base de datos.**

Los archivos se almacenan en Supabase Storage en la carpeta \`incapacidades/\`.

**Tamaño máximo:** 10MB
**Formatos permitidos:** PDF, PNG, JPG, JPEG

**Ejemplo con curl:**
\`\`\`bash
curl -X POST http://localhost:3005/documents/upload \\
  -H "Authorization: Bearer tu-token-aqui" \\
  -F "file=@/ruta/al/archivo.pdf" \\
  -F "incapacidadId=123e4567-e89b-12d3-a456-426614174000" \\
  -F "tipoDocumento=pdf_incapacidad" \\
  -F "descripcion=Incapacidad por gripe"
\`\`\`
    `,
  })
  @ApiBody({
    description: 'Datos del documento y archivo',
    schema: {
      type: 'object',
      required: ['file', 'incapacidadId', 'tipoDocumento'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (PDF, PNG, JPG, JPEG)',
        },
        incapacidadId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'ID de la incapacidad',
        },
        tipoDocumento: {
          type: 'string',
          example: 'pdf_incapacidad',
          description: 'Tipo de documento',
        },
        descripcion: {
          type: 'string',
          example: 'Incapacidad por gripe del 15 al 20 de noviembre',
          description: 'Descripción opcional del documento',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documento subido exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        incapacidad_id: '987e6543-e21b-45c6-a789-123456789abc',
        nombre_archivo: 'incapacidad.pdf',
        formato: 'PDF',
        tamano_bytes: 245678,
        storage_path: 'incapacidades/1732198765432-abc123def456.pdf',
        url_publica: 'https://cioybkbaeldkzuunvxlt.supabase.co/storage/v1/object/public/documentos/incapacidades/1732198765432-abc123def456.pdf',
        fecha_subida: '2024-11-21T10:30:00.000Z',
        validado: false,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o faltante' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async uploadDocumento(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(pdf|png|jpg|jpeg)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDocumentoDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.documentsService.uploadDocumento(dto, file, user.sub);
  }

  @Get('incapacidad/:incapacidadId')
  @ApiOperation({
    summary: 'Obtener todos los documentos de una incapacidad',
    description: 'Retorna la lista de documentos asociados a una incapacidad específica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de documentos',
    type: [Object],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getDocumentosByIncapacidad(
    @Param('incapacidadId') incapacidadId: string,
  ): Promise<any[]> {
    return this.documentsService.getDocumentosByIncapacidad(incapacidadId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un documento por ID',
    description: 'Retorna la información de un documento específico.',
  })
  @ApiResponse({ status: 200, description: 'Documento encontrado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getDocumentoById(@Param('id') id: string): Promise<any> {
    return this.documentsService.getDocumentoById(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un documento',
    description:
      'Elimina el documento tanto del storage de Supabase como de la base de datos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async deleteDocumento(@Param('id') id: string): Promise<void> {
    return this.documentsService.deleteDocumento(id);
  }
}
