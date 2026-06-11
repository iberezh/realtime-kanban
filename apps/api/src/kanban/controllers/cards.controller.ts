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
import type { Card } from '../../database/schema';
import {
  CreateCardCommand,
  DeleteCardCommand,
  MoveCardCommand,
  UpdateCardCommand,
} from '../commands/card.commands';
import { CreateCardDto, MoveCardDto, UpdateCardDto } from '../dto/card.dto';

@ApiTags('cards')
@Controller()
export class CardsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('columns/:columnId/cards')
  @ApiCreatedResponse({ description: 'The created card, placed at the end of the column.' })
  create(
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() dto: CreateCardDto,
  ): Promise<Card> {
    return this.commandBus.execute(
      new CreateCardCommand(columnId, dto.title, dto.description ?? null),
    );
  }

  @Patch('cards/:id')
  @ApiOkResponse({ description: 'The updated card.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCardDto): Promise<Card> {
    return this.commandBus.execute(
      new UpdateCardCommand(id, {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
      }),
    );
  }

  @Post('cards/:id/move')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'The card with its new column and rank.' })
  move(@Param('id', ParseUUIDPipe) id: string, @Body() dto: MoveCardDto): Promise<Card> {
    return this.commandBus.execute(
      new MoveCardCommand(id, dto.toColumnId, dto.beforeCardId ?? null),
    );
  }

  @Delete('cards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Card deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.commandBus.execute(new DeleteCardCommand(id));
  }
}
