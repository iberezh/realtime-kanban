import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BillingModule } from '../billing/billing.module';
import { KanbanModule } from '../kanban/kanban.module';
import { LabelsModule } from '../labels/labels.module';
import { PublicShareController } from './public-share.controller';
import {
  CreateShareLinkHandler,
  RevokeShareLinkHandler,
  RotateShareLinkHandler,
} from './share.command-handlers';
import {
  BoardIdForShareTokenHandler,
  ListBoardShareLinksHandler,
  ResolveShareLinkHandler,
} from './share.query-handlers';
import { ShareLinkRepository } from './share-link.repository';
import { ShareLinksController } from './share-links.controller';

@Module({
  imports: [CqrsModule, KanbanModule, LabelsModule, BillingModule],
  controllers: [ShareLinksController, PublicShareController],
  providers: [
    ShareLinkRepository,
    CreateShareLinkHandler,
    RevokeShareLinkHandler,
    RotateShareLinkHandler,
    ListBoardShareLinksHandler,
    ResolveShareLinkHandler,
    BoardIdForShareTokenHandler,
  ],
})
export class ShareModule {}
