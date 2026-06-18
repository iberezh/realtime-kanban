import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResolveShareLinkQuery } from './share.queries';
import type { SharedBoardView } from './share.views';

/** Unauthenticated: the share token itself is the access credential. */
@ApiTags('share')
@Controller('share')
export class PublicShareController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':token')
  @ApiOkResponse({ description: 'The read-only board behind a share token.' })
  resolve(@Param('token') token: string): Promise<SharedBoardView> {
    return this.queryBus.execute(new ResolveShareLinkQuery(token));
  }
}
