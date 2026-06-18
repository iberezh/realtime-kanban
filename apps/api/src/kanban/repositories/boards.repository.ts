import { Inject, Injectable } from '@nestjs/common';
import { asc, count, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { type Board, boards, columns } from '../../database/schema';

@Injectable()
export class BoardsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(title: string, accountId: string): Promise<Board> {
    const [board] = await this.db.insert(boards).values({ title, accountId }).returning();
    if (!board) throw new Error('Board insert returned no row');
    return board;
  }

  async findById(id: string): Promise<Board | null> {
    const [board] = await this.db.select().from(boards).where(eq(boards.id, id));
    return board ?? null;
  }

  async findByColumnId(columnId: string): Promise<Board | null> {
    const [row] = await this.db
      .select({ board: boards })
      .from(boards)
      .innerJoin(columns, eq(columns.boardId, boards.id))
      .where(eq(columns.id, columnId))
      .limit(1);
    return row?.board ?? null;
  }

  async listByAccount(accountId: string): Promise<Board[]> {
    return this.db
      .select()
      .from(boards)
      .where(eq(boards.accountId, accountId))
      .orderBy(asc(boards.createdAt));
  }

  async countByAccount(accountId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(boards)
      .where(eq(boards.accountId, accountId));
    return row?.value ?? 0;
  }

  async rename(id: string, title: string): Promise<Board | null> {
    const [board] = await this.db
      .update(boards)
      .set({ title })
      .where(eq(boards.id, id))
      .returning();
    return board ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(boards)
      .where(eq(boards.id, id))
      .returning({ id: boards.id });
    return deleted.length > 0;
  }
}
