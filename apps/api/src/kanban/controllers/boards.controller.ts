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
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthContext } from '../../auth/auth.types';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
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
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'The created board.' })
  create(@Body() dto: CreateBoardDto, @CurrentUser() ctx: AuthContext): Promise<Board> {
    return this.commandBus.execute(new CreateBoardCommand(dto.title, ctx.accountId));
  }

  @Get()
  @ApiOkResponse({ description: "All boards for the caller's workspace, oldest first." })
  list(@CurrentUser() ctx: AuthContext): Promise<Board[]> {
    return this.queryBus.execute(new ListBoardsQuery(ctx.accountId));
  }

  @Get(':id')
  @ApiOkResponse({ description: 'The board with its columns and cards in rank order.' })
  get(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() ctx: AuthContext): Promise<BoardView> {
    return this.queryBus.execute(new GetBoardQuery(id, ctx.accountId));
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'The renamed board.' })
  rename(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RenameBoardDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Board> {
    return this.commandBus.execute(new RenameBoardCommand(id, dto.title, ctx.accountId));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Board deleted with all its columns and cards.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    return this.commandBus.execute(new DeleteBoardCommand(id, ctx.accountId));
  }
}
