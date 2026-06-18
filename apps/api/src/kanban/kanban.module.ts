import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BillingModule } from '../billing/billing.module';
import { LabelsModule } from '../labels/labels.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityProjection } from './activity/activity.projection';
import { SetCardAssigneeHandler } from './commands/assignee.handlers';
import {
  CreateBoardHandler,
  DeleteBoardHandler,
  RenameBoardHandler,
} from './commands/board.handlers';
import {
  CreateCardHandler,
  DeleteCardHandler,
  MoveCardHandler,
  UpdateCardHandler,
} from './commands/card.handlers';
import { AttachLabelHandler, DetachLabelHandler } from './commands/card-label.handlers';
import {
  AddChecklistItemHandler,
  DeleteChecklistItemHandler,
  UpdateChecklistItemHandler,
} from './commands/checklist.handlers';
import {
  CreateColumnHandler,
  DeleteColumnHandler,
  MoveColumnHandler,
  RenameColumnHandler,
  SetColumnWipLimitHandler,
} from './commands/column.handlers';
import { CreateCommentHandler, DeleteCommentHandler } from './commands/comment.handlers';
import { ActivityController } from './controllers/activity.controller';
import { BoardsController } from './controllers/boards.controller';
import { CardsController } from './controllers/cards.controller';
import { ChecklistController } from './controllers/checklist.controller';
import { ColumnsController } from './controllers/columns.controller';
import { CommentsController } from './controllers/comments.controller';
import { MembersController } from './controllers/members.controller';
import { ListBoardActivityHandler } from './queries/activity.query-handlers';
import { GetBoardHandler, ListBoardsHandler } from './queries/board.query-handlers';
import { ListCardCommentsHandler } from './queries/comment.query-handlers';
import { ListMembersHandler } from './queries/members.query-handlers';
import { ActivityRepository } from './repositories/activity.repository';
import { BoardsRepository } from './repositories/boards.repository';
import { CardLabelsRepository } from './repositories/card-labels.repository';
import { CardsRepository } from './repositories/cards.repository';
import { ChecklistRepository } from './repositories/checklist.repository';
import { ColumnsRepository } from './repositories/columns.repository';
import { CommentsRepository } from './repositories/comments.repository';
import { MembersRepository } from './repositories/members.repository';

const commandHandlers = [
  CreateBoardHandler,
  RenameBoardHandler,
  DeleteBoardHandler,
  CreateColumnHandler,
  RenameColumnHandler,
  MoveColumnHandler,
  DeleteColumnHandler,
  SetColumnWipLimitHandler,
  CreateCardHandler,
  UpdateCardHandler,
  MoveCardHandler,
  DeleteCardHandler,
  AttachLabelHandler,
  DetachLabelHandler,
  SetCardAssigneeHandler,
  AddChecklistItemHandler,
  UpdateChecklistItemHandler,
  DeleteChecklistItemHandler,
  CreateCommentHandler,
  DeleteCommentHandler,
];

const queryHandlers = [
  ListBoardsHandler,
  GetBoardHandler,
  ListMembersHandler,
  ListBoardActivityHandler,
  ListCardCommentsHandler,
];

@Module({
  imports: [CqrsModule, LabelsModule, BillingModule, NotificationsModule],
  controllers: [
    BoardsController,
    ColumnsController,
    CardsController,
    ChecklistController,
    MembersController,
    ActivityController,
    CommentsController,
  ],
  providers: [
    BoardsRepository,
    ColumnsRepository,
    CardsRepository,
    CardLabelsRepository,
    ChecklistRepository,
    MembersRepository,
    ActivityRepository,
    CommentsRepository,
    ActivityProjection,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [
    BoardsRepository,
    ColumnsRepository,
    CardsRepository,
    CardLabelsRepository,
    ChecklistRepository,
  ],
})
export class KanbanModule {}
