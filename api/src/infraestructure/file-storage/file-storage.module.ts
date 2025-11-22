import { Module } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service';
import { SupabaseModule } from '../external-apis/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [SupabaseStorageService],
  exports: [SupabaseStorageService],
})
export class FileStorageModule {}
