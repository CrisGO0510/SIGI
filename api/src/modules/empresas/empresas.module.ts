import { Module } from '@nestjs/common';
import { EmpresasService } from './services/empresas.service';
import { EmpresasController } from './controllers/empresas.controller';
import { EmpresaRepository } from './repositories/empresa.repository';
import { SupabaseModule } from '../../infraestructure/external-apis/supabase';

@Module({
  imports: [SupabaseModule],
  controllers: [EmpresasController],
  providers: [EmpresasService, EmpresaRepository],
  exports: [EmpresasService, EmpresaRepository],
})
export class EmpresasModule {}
