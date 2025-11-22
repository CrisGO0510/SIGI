import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './infraestructure/external-apis/supabase';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IncapacitiesModule } from './modules/incapacities/incapacities.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    UsersModule,
    IncapacitiesModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // Aplica AuthGuard globalmente a todos los endpoints
    },
  ],
})
export class AppModule {}
