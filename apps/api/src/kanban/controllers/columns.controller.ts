import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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
import type { Column } from '../../database/schema';
import {
  CreateColumnCommand,
  DeleteColumnCommand,
  MoveColumnCommand,
  RenameColumnCommand,
} from '../commands/column.commands';
import { CreateColumnDto, MoveColumnDto, RenameColumnDto } from '../dto/column.dto';

@ApiTags('columns')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ColumnsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('boards/:boardId/columns')
  @ApiCreatedResponse({ description: 'The created column, placed at the end of the board.' })
  create(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateColumnDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Column> {
    return this.commandBus.execute(new CreateColumnCommand(boardId, dto.title, ctx.accountId));
  }

  @Patch('columns/:id')
  @ApiOkResponse({ description: 'The renamed column.' })
  rename(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RenameColumnDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Column> {
    return this.commandBus.execute(new RenameColumnCommand(id, dto.title, ctx.accountId));
  }

  @Post('columns/:id/move')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'The column with its new rank.' })
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveColumnDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Column> {
    return this.commandBus.execute(
      new MoveColumnCommand(id, dto.beforeColumnId ?? null, ctx.accountId),
    );
  }

  @Delete('columns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Column deleted with all its cards.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    return this.commandBus.execute(new DeleteColumnCommand(id, ctx.accountId));
  }
}
