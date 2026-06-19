import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfiguredSocketIoAdapter } from './realtime/socket-io.adapter';

async function bootstrap(): Promise<void> {
  // rawBody lets the Stripe webhook verify its signature over the exact bytes.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);
  const corsOrigin = config.getOrThrow<string>('CORS_ORIGIN');

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.use(cookieParser());
  const redisUrl = config.get<string>('REDIS_URL');
  app.useWebSocketAdapter(new ConfiguredSocketIoAdapter(app, corsOrigin, redisUrl));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Realtime Kanban API')
    .setDescription('Commands and queries behind the realtime Kanban board')
    .setVersion('0.1.0')
    .addCookieAuth('lane_token')
    .build();
  SwaggerModule.setup('api/v1/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(config.getOrThrow<number>('PORT'));
}

void bootstrap();
