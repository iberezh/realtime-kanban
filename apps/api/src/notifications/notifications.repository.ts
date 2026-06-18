import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../database/database.module';
import { type Notification, notifications } from '../database/schema';

export interface NewNotification {
  id: string;
  userId: string;
  type: string;
  data: Record<string, unknown>;
}

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(row: NewNotification): Promise<Notification> {
    const [inserted] = await this.db.insert(notifications).values(row).returning();
    if (!inserted) throw new Error('Notification insert returned no row');
    return inserted;
  }

  async listByUser(userId: string, limit = 30): Promise<Notification[]> {
    return this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async unreadCount(userId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return row?.count ?? 0;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  }
}
