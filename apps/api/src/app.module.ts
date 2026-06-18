import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { KanbanModule } from './kanban/kanban.module';
import { LabelsModule } from './labels/labels.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ShareModule } from './share/share.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    BillingModule,
    KanbanModule,
    LabelsModule,
    RealtimeModule,
    ShareModule,
  ],
})
export class AppModule {}
