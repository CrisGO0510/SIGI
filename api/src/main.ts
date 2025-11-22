import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Debug: muestra la carpeta desde la que se cargó .env y la URL (si existe)
// eslint-disable-next-line no-console
console.log('CONFIG DEBUG: cwd=', process.cwd());
// eslint-disable-next-line no-console
console.log('CONFIG DEBUG: SUPABASE_URL=', process.env.SUPABASE_URL ?? 'SUPABASE_URL not set');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar ValidationPipe globalmente para validar DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma tipos automáticamente
    }),
  );

  // Configurar CORS para permitir peticiones del frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  // Configurar Swagger automático con decoradores
  const config = new DocumentBuilder()
    .setTitle('SIGI API')
    .setDescription('Sistema de Gestión de Incapacidades - API REST')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('incapacities', 'Gestión de incapacidades')
    .addTag('documents', 'Gestión de documentos')
    .addTag('notifications', 'Gestión de notificaciones')
    .addTag('reports', 'Generación de reportes')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresar JWT token',
        in: 'header',
      },
      'JWT-auth', // Este es el nombre que usaremos en @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'SIGI API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      url: '/docs-json',
    },
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
    ],
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.css',
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}/`);
  // eslint-disable-next-line no-console
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
  // eslint-disable-next-line no-console
  console.log(`OpenAPI JSON available at http://localhost:${port}/docs-json`);
}

bootstrap();
