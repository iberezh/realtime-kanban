import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { type Column, columns } from '../../database/schema';
import type { RankedItem } from '../ranking/placement';

export interface NewColumn {
  boardId: string;
  title: string;
  rank: string;
}

@Injectable()
export class ColumnsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: NewColumn): Promise<Column> {
    const [column] = await this.db.insert(columns).values(input).returning();
    if (!column) {
      throw new Error('Column insert returned no row');
    }
    return column;
  }

  async findById(id: string): Promise<Column | null> {
    const [column] = await this.db.select().from(columns).where(eq(columns.id, id));
    return column ?? null;
  }

  async listByBoard(boardId: string): Promise<Column[]> {
    return this.db
      .select()
      .from(columns)
      .where(eq(columns.boardId, boardId))
      .orderBy(asc(columns.rank));
  }

  async listRanks(boardId: string): Promise<RankedItem[]> {
    return this.db
      .select({ id: columns.id, rank: columns.rank })
      .from(columns)
      .where(eq(columns.boardId, boardId))
      .orderBy(asc(columns.rank));
  }

  async lastRank(boardId: string): Promise<string | null> {
    const [last] = await this.db
      .select({ rank: columns.rank })
      .from(columns)
      .where(eq(columns.boardId, boardId))
      .orderBy(desc(columns.rank))
      .limit(1);
    return last?.rank ?? null;
  }

  async rename(id: string, title: string): Promise<Column | null> {
    const [column] = await this.db
      .update(columns)
      .set({ title })
      .where(eq(columns.id, id))
      .returning();
    return column ?? null;
  }

  async updateRank(id: string, rank: string): Promise<Column | null> {
    const [column] = await this.db
      .update(columns)
      .set({ rank })
      .where(eq(columns.id, id))
      .returning();
    return column ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(columns)
      .where(eq(columns.id, id))
      .returning({ id: columns.id });
    return deleted.length > 0;
  }
}
