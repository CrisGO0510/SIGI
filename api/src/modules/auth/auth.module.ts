import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { EmpresasModule } from '../empresas/empresas.module';
import { EmailModule } from '../../infraestructure/email/email.module';
import { PasswordResetRepository } from './repositories/password-reset.repository';

@Module({
  imports: [
    UsersModule,
    EmpresasModule,
    EmailModule,
    JwtModule.register({
      global: true, // Hace que JwtService esté disponible globalmente
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: {
        expiresIn: '7d', // Token válido por 7 días
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetRepository],
  exports: [AuthService],
})
export class AuthModule {}
