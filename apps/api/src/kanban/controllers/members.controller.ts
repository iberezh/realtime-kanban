import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../../auth/auth.types';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ListMembersQuery } from '../queries/members.queries';
import type { MemberView } from '../repositories/members.repository';

@ApiTags('members')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOkResponse({ description: "All members of the caller's workspace." })
  list(@CurrentUser() ctx: AuthContext): Promise<MemberView[]> {
    return this.queryBus.execute(new ListMembersQuery(ctx.accountId));
  }
}
