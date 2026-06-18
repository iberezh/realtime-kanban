import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Notification } from '../database/schema';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOkResponse({ description: 'Most recent 30 notifications for the caller.' })
  list(@CurrentUser() ctx: AuthContext): Promise<Notification[]> {
    return this.service.list(ctx.userId);
  }

  @Get('unread-count')
  @ApiOkResponse({ description: 'Count of unread notifications.' })
  async unreadCount(@CurrentUser() ctx: AuthContext): Promise<{ count: number }> {
    const count = await this.service.unreadCount(ctx.userId);
    return { count };
  }

  @Post('read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'All notifications marked as read.' })
  markRead(@CurrentUser() ctx: AuthContext): Promise<void> {
    return this.service.markAllRead(ctx.userId);
  }
}
