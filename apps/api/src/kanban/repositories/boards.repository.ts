import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { type Board, boards } from '../../database/schema';

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

  async listByAccount(accountId: string): Promise<Board[]> {
    return this.db
      .select()
      .from(boards)
      .where(eq(boards.accountId, accountId))
      .orderBy(asc(boards.createdAt));
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
