import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../database/database.module';
import { type ShareLink, shareLinks } from '../database/schema';

export interface NewShareLink {
  boardId: string;
  token: string;
  createdBy: string | null;
}

@Injectable()
export class ShareLinkRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: NewShareLink): Promise<ShareLink> {
    const [row] = await this.db.insert(shareLinks).values(input).returning();
    if (!row) {
      throw new Error('Share link insert returned no row');
    }
    return row;
  }

  async findByToken(token: string): Promise<ShareLink | null> {
    const [row] = await this.db.select().from(shareLinks).where(eq(shareLinks.token, token));
    return row ?? null;
  }

  async findById(id: string): Promise<ShareLink | null> {
    const [row] = await this.db.select().from(shareLinks).where(eq(shareLinks.id, id));
    return row ?? null;
  }

  async listByBoard(boardId: string): Promise<ShareLink[]> {
    return this.db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.boardId, boardId))
      .orderBy(desc(shareLinks.createdAt));
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(shareLinks)
      .where(eq(shareLinks.id, id))
      .returning({ id: shareLinks.id });
    return deleted.length > 0;
  }
}
