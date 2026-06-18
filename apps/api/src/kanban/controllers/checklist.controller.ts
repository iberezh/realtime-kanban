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
import type { ChecklistItem } from '../../database/schema';
import {
  AddChecklistItemCommand,
  DeleteChecklistItemCommand,
  UpdateChecklistItemCommand,
} from '../commands/checklist.commands';
import { AddChecklistItemDto, UpdateChecklistItemDto } from '../dto/checklist.dto';

@ApiTags('checklist')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ChecklistController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('cards/:cardId/checklist')
  @ApiCreatedResponse({ description: 'The created checklist item, appended to the card.' })
  add(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: AddChecklistItemDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<ChecklistItem> {
    return this.commandBus.execute(
      new AddChecklistItemCommand(cardId, dto.text, ctx.accountId, ctx.userId),
    );
  }

  @Patch('checklist/:id')
  @ApiOkResponse({ description: 'The updated checklist item.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<ChecklistItem> {
    return this.commandBus.execute(
      new UpdateChecklistItemCommand(
        id,
        {
          ...(dto.text !== undefined && { text: dto.text }),
          ...(dto.done !== undefined && { done: dto.done }),
        },
        ctx.accountId,
        ctx.userId,
      ),
    );
  }

  @Delete('checklist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Checklist item deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    return this.commandBus.execute(new DeleteChecklistItemCommand(id, ctx.accountId, ctx.userId));
  }
}
