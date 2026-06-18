import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { CreateCommentCommand, DeleteCommentCommand } from '../commands/comment.commands';
import { CreateCommentDto } from '../dto/comment.dto';
import { ListCardCommentsQuery } from '../queries/comment.queries';
import type { CommentView } from '../repositories/comments.repository';

@ApiTags('comments')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('cards/:cardId/comments')
  @ApiCreatedResponse({ description: 'The created comment with author display info.' })
  create(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<CommentView> {
    return this.commandBus.execute(
      new CreateCommentCommand(
        cardId,
        dto.body,
        dto.mentionedUserIds ?? [],
        ctx.accountId,
        ctx.userId,
      ),
    );
  }

  @Get('cards/:cardId/comments')
  @ApiOkResponse({ description: 'All comments for the card, ordered by createdAt ascending.' })
  list(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @CurrentUser() ctx: AuthContext,
  ): Promise<CommentView[]> {
    return this.queryBus.execute(new ListCardCommentsQuery(cardId, ctx.accountId));
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Comment deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    return this.commandBus.execute(new DeleteCommentCommand(id, ctx.accountId, ctx.userId));
  }
}
