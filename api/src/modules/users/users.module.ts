import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UserRepository } from './repositories/user.repository';
import { SupabaseModule } from '../../infraestructure/external-apis/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [UsersController],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UsersModule {}
