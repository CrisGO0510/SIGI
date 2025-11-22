import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmpresasModule } from '../../modules/empresas/empresas.module';
import { IncapacitiesModule } from '../../modules/incapacities/incapacities.module';
import { DocumentsModule } from '../../modules/documents/documents.module';
import { FileStorageModule } from '../file-storage/file-storage.module';

@Module({
  imports: [EmpresasModule, IncapacitiesModule, DocumentsModule, FileStorageModule],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
