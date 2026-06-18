import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LabelsModule } from '../labels/labels.module';
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
  CreateColumnHandler,
  DeleteColumnHandler,
  MoveColumnHandler,
  RenameColumnHandler,
} from './commands/column.handlers';
import { ActivityController } from './controllers/activity.controller';
import { BoardsController } from './controllers/boards.controller';
import { CardsController } from './controllers/cards.controller';
import { ColumnsController } from './controllers/columns.controller';
import { MembersController } from './controllers/members.controller';
import { ListBoardActivityHandler } from './queries/activity.query-handlers';
import { GetBoardHandler, ListBoardsHandler } from './queries/board.query-handlers';
import { ListMembersHandler } from './queries/members.query-handlers';
import { ActivityRepository } from './repositories/activity.repository';
import { BoardsRepository } from './repositories/boards.repository';
import { CardLabelsRepository } from './repositories/card-labels.repository';
import { CardsRepository } from './repositories/cards.repository';
import { ColumnsRepository } from './repositories/columns.repository';
import { MembersRepository } from './repositories/members.repository';

const commandHandlers = [
  CreateBoardHandler,
  RenameBoardHandler,
  DeleteBoardHandler,
  CreateColumnHandler,
  RenameColumnHandler,
  MoveColumnHandler,
  DeleteColumnHandler,
  CreateCardHandler,
  UpdateCardHandler,
  MoveCardHandler,
  DeleteCardHandler,
  AttachLabelHandler,
  DetachLabelHandler,
  SetCardAssigneeHandler,
];

const queryHandlers = [
  ListBoardsHandler,
  GetBoardHandler,
  ListMembersHandler,
  ListBoardActivityHandler,
];

@Module({
  imports: [CqrsModule, LabelsModule],
  controllers: [
    BoardsController,
    ColumnsController,
    CardsController,
    MembersController,
    ActivityController,
  ],
  providers: [
    BoardsRepository,
    ColumnsRepository,
    CardsRepository,
    CardLabelsRepository,
    MembersRepository,
    ActivityRepository,
    ActivityProjection,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class KanbanModule {}
