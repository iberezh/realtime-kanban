import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Board } from '../../database/schema';
import {
  CreateBoardCommand,
  DeleteBoardCommand,
  RenameBoardCommand,
} from '../commands/board.commands';
import { CreateBoardDto, RenameBoardDto } from '../dto/board.dto';
import { GetBoardQuery, ListBoardsQuery } from '../queries/board.queries';
import type { BoardView } from '../queries/board.views';

@ApiTags('boards')
@Controller('boards')
export class BoardsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'The created board.' })
  create(@Body() dto: CreateBoardDto): Promise<Board> {
    return this.commandBus.execute(new CreateBoardCommand(dto.title));
  }

  @Get()
  @ApiOkResponse({ description: 'All boards, oldest first.' })
  list(): Promise<Board[]> {
    return this.queryBus.execute(new ListBoardsQuery());
  }

  @Get(':id')
  @ApiOkResponse({ description: 'The board with its columns and cards in rank order.' })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<BoardView> {
    return this.queryBus.execute(new GetBoardQuery(id));
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'The renamed board.' })
  rename(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RenameBoardDto): Promise<Board> {
    return this.commandBus.execute(new RenameBoardCommand(id, dto.title));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Board deleted with all its columns and cards.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.commandBus.execute(new DeleteBoardCommand(id));
  }
}
