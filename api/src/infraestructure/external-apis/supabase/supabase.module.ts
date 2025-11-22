import { Global, Module } from '@nestjs/common';
import { SupabaseClientService } from './supabase.service';

@Global()
@Module({
  providers: [SupabaseClientService],
  exports: [SupabaseClientService],
})
export class SupabaseModule {}
