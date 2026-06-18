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
import type { Card } from '../../database/schema';
import { SetCardAssigneeCommand } from '../commands/assignee.commands';
import {
  CreateCardCommand,
  DeleteCardCommand,
  MoveCardCommand,
  UpdateCardCommand,
} from '../commands/card.commands';
import { AttachLabelCommand, DetachLabelCommand } from '../commands/card-label.commands';
import {
  AttachLabelDto,
  CreateCardDto,
  MoveCardDto,
  SetAssigneeDto,
  UpdateCardDto,
} from '../dto/card.dto';

@ApiTags('cards')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CardsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('columns/:columnId/cards')
  @ApiCreatedResponse({ description: 'The created card, placed at the end of the column.' })
  create(
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() dto: CreateCardDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Card> {
    return this.commandBus.execute(
      new CreateCardCommand(
        columnId,
        dto.title,
        dto.description ?? null,
        ctx.accountId,
        ctx.userId,
      ),
    );
  }

  @Patch('cards/:id')
  @ApiOkResponse({ description: 'The updated card.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCardDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Card> {
    return this.commandBus.execute(
      new UpdateCardCommand(
        id,
        {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.dueAt !== undefined && { dueAt: dto.dueAt ? new Date(dto.dueAt) : null }),
        },
        ctx.accountId,
        ctx.userId,
      ),
    );
  }

  @Post('cards/:id/move')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'The card with its new column and rank.' })
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveCardDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Card> {
    return this.commandBus.execute(
      new MoveCardCommand(id, dto.toColumnId, dto.beforeCardId ?? null, ctx.accountId, ctx.userId),
    );
  }

  @Delete('cards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Card deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    return this.commandBus.execute(new DeleteCardCommand(id, ctx.accountId, ctx.userId));
  }

  @Post('cards/:id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Label attached to card.' })
  attachLabel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AttachLabelDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<void> {
    return this.commandBus.execute(
      new AttachLabelCommand(id, dto.labelId, ctx.accountId, ctx.userId),
    );
  }

  @Delete('cards/:id/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Label detached from card.' })
  detachLabel(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
    @CurrentUser() ctx: AuthContext,
  ): Promise<void> {
    return this.commandBus.execute(new DetachLabelCommand(id, labelId, ctx.accountId, ctx.userId));
  }

  @Patch('cards/:id/assignee')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Assignee updated.' })
  setAssignee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetAssigneeDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<void> {
    return this.commandBus.execute(
      new SetCardAssigneeCommand(id, dto.assigneeId ?? null, ctx.accountId, ctx.userId),
    );
  }
}
