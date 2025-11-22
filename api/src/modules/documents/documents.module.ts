import { Module } from '@nestjs/common';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentsService } from './services/documents.service';
import { DocumentoRepository } from './repositories/documento.repository';
import { SupabaseModule } from '../../infraestructure/external-apis/supabase/supabase.module';
import { FileStorageModule } from '../../infraestructure/file-storage/file-storage.module';

@Module({
  imports: [SupabaseModule, FileStorageModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentoRepository],
  exports: [DocumentsService, DocumentoRepository],
})
export class DocumentsModule {}
