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
import type { AuthContext } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { ShareLink } from '../database/schema';
import { CreateShareLinkCommand, RevokeShareLinkCommand } from './share.commands';
import { CreateShareLinkDto } from './share.dto';
import { ListBoardShareLinksQuery } from './share.queries';

@ApiTags('share-links')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ShareLinksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('boards/:boardId/share-links')
  @ApiCreatedResponse({ description: 'A new public, read-only link for the board.' })
  create(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateShareLinkDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<ShareLink> {
    return this.commandBus.execute(
      new CreateShareLinkCommand(
        boardId,
        ctx.accountId,
        ctx.userId,
        dto.expiresAt ? new Date(dto.expiresAt) : null,
      ),
    );
  }

  @Get('boards/:boardId/share-links')
  @ApiOkResponse({ description: 'Active share links for the board.' })
  list(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @CurrentUser() ctx: AuthContext,
  ): Promise<ShareLink[]> {
    return this.queryBus.execute(new ListBoardShareLinksQuery(boardId, ctx.accountId));
  }

  @Delete('share-links/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Share link revoked.' })
  revoke(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    return this.commandBus.execute(new RevokeShareLinkCommand(id, ctx.accountId));
  }
}
