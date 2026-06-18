import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../../auth/auth.types';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import type { Activity } from '../../database/schema';
import { ListBoardActivityQuery } from '../queries/activity.queries';

@ApiTags('activity')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class ActivityController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':boardId/activity')
  @ApiOkResponse({ description: 'Recent activity for the board.' })
  list(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Activity[]> {
    return this.queryBus.execute(new ListBoardActivityQuery(boardId, ctx.accountId));
  }
}
