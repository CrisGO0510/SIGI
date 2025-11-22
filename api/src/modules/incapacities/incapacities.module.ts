import { Module } from '@nestjs/common';
import { IncapacidadesController } from './controllers';
import { IncapacidadesService } from './services';
import { IncapacidadRepository, PagoRepository } from './repositories';
import { SupabaseModule } from '../../infraestructure/external-apis/supabase';

@Module({
  imports: [SupabaseModule],
  controllers: [IncapacidadesController],
  providers: [IncapacidadesService, IncapacidadRepository, PagoRepository],
  exports: [IncapacidadesService, IncapacidadRepository, PagoRepository],
})
export class IncapacitiesModule {}
