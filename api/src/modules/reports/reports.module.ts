import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { IncapacidadRepository } from '../incapacities/repositories/incapacidad.repository';
import { SupabaseModule } from '../../infraestructure/external-apis/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService, IncapacidadRepository],
  exports: [ReportsService],
})
export class ReportsModule {}
