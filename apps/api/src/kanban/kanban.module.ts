import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
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
import {
  CreateColumnHandler,
  DeleteColumnHandler,
  MoveColumnHandler,
  RenameColumnHandler,
} from './commands/column.handlers';
import { BoardsController } from './controllers/boards.controller';
import { CardsController } from './controllers/cards.controller';
import { ColumnsController } from './controllers/columns.controller';
import { GetBoardHandler, ListBoardsHandler } from './queries/board.query-handlers';
import { BoardsRepository } from './repositories/boards.repository';
import { CardsRepository } from './repositories/cards.repository';
import { ColumnsRepository } from './repositories/columns.repository';

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
];

const queryHandlers = [ListBoardsHandler, GetBoardHandler];

@Module({
  imports: [CqrsModule],
  controllers: [BoardsController, ColumnsController, CardsController],
  providers: [
    BoardsRepository,
    ColumnsRepository,
    CardsRepository,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class KanbanModule {}
