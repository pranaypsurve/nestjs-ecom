import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Get CORS configuration from environment
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', '*')
    .split(',')
    .map((origin) => origin.trim());
  
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  
  // Enable CORS with credentials
  app.enableCors({
    origin: corsOrigin || allowedOrigins.length === 1 && allowedOrigins[0] === '*' 
      ? true 
      : process.env.NODE_ENV === 'production' 
        ? allowedOrigins 
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Enable cookie parser - MUST be before other middleware
  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe());
  
  const port = process.env.PORT || configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
