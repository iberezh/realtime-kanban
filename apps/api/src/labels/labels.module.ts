import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BillingModule } from '../billing/billing.module';
import { CreateLabelHandler, DeleteLabelHandler, RenameLabelHandler } from './label.handlers';
import { ListLabelsHandler } from './label.query-handlers';
import { LabelsController } from './labels.controller';
import { LabelsRepository } from './labels.repository';

@Module({
  imports: [CqrsModule, BillingModule],
  controllers: [LabelsController],
  providers: [
    LabelsRepository,
    CreateLabelHandler,
    RenameLabelHandler,
    DeleteLabelHandler,
    ListLabelsHandler,
  ],
  exports: [LabelsRepository],
})
export class LabelsModule {}
