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
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Column } from '../../database/schema';
import {
  CreateColumnCommand,
  DeleteColumnCommand,
  MoveColumnCommand,
  RenameColumnCommand,
} from '../commands/column.commands';
import { CreateColumnDto, MoveColumnDto, RenameColumnDto } from '../dto/column.dto';

@ApiTags('columns')
@Controller()
export class ColumnsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('boards/:boardId/columns')
  @ApiCreatedResponse({ description: 'The created column, placed at the end of the board.' })
  create(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateColumnDto,
  ): Promise<Column> {
    return this.commandBus.execute(new CreateColumnCommand(boardId, dto.title));
  }

  @Patch('columns/:id')
  @ApiOkResponse({ description: 'The renamed column.' })
  rename(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RenameColumnDto): Promise<Column> {
    return this.commandBus.execute(new RenameColumnCommand(id, dto.title));
  }

  @Post('columns/:id/move')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'The column with its new rank.' })
  move(@Param('id', ParseUUIDPipe) id: string, @Body() dto: MoveColumnDto): Promise<Column> {
    return this.commandBus.execute(new MoveColumnCommand(id, dto.beforeColumnId ?? null));
  }

  @Delete('columns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Column deleted with all its cards.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.commandBus.execute(new DeleteColumnCommand(id));
  }
}
