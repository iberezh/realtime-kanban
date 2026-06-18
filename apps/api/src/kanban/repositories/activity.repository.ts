import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { type Activity, activity } from '../../database/schema';

export interface NewActivity {
  boardId: string;
  actorId: string | null;
  type: string;
  data: Record<string, unknown>;
}

@Injectable()
export class ActivityRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async insert(row: NewActivity): Promise<void> {
    await this.db.insert(activity).values(row);
  }

  async listByBoard(boardId: string, limit = 50, since?: Date): Promise<Activity[]> {
    const conditions = since
      ? and(eq(activity.boardId, boardId), gte(activity.createdAt, since))
      : eq(activity.boardId, boardId);
    return this.db
      .select()
      .from(activity)
      .where(conditions)
      .orderBy(desc(activity.createdAt))
      .limit(limit);
  }
}
