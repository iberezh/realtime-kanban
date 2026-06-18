import { Injectable } from '@nestjs/common';
import type { Notification } from '../database/schema';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly repo: NotificationsRepository) {}

  list(userId: string): Promise<Notification[]> {
    return this.repo.listByUser(userId);
  }

  unreadCount(userId: string): Promise<number> {
    return this.repo.unreadCount(userId);
  }

  markAllRead(userId: string): Promise<void> {
    return this.repo.markAllRead(userId);
  }
}
