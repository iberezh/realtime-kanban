import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { type Card, cards, columns } from '../../database/schema';
import type { RankedItem } from '../ranking/placement';

export interface NewCard {
  columnId: string;
  title: string;
  description: string | null;
  rank: string;
}

export interface CardPatch {
  title?: string;
  description?: string | null;
}

@Injectable()
export class CardsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: NewCard): Promise<Card> {
    const [card] = await this.db.insert(cards).values(input).returning();
    if (!card) {
      throw new Error('Card insert returned no row');
    }
    return card;
  }

  async findById(id: string): Promise<Card | null> {
    const [card] = await this.db.select().from(cards).where(eq(cards.id, id));
    return card ?? null;
  }

  async listByBoard(boardId: string): Promise<Card[]> {
    const rows = await this.db
      .select({ card: cards })
      .from(cards)
      .innerJoin(columns, eq(cards.columnId, columns.id))
      .where(eq(columns.boardId, boardId))
      .orderBy(asc(cards.rank));
    return rows.map((row) => row.card);
  }

  async listRanks(columnId: string): Promise<RankedItem[]> {
    return this.db
      .select({ id: cards.id, rank: cards.rank })
      .from(cards)
      .where(eq(cards.columnId, columnId))
      .orderBy(asc(cards.rank));
  }

  async lastRank(columnId: string): Promise<string | null> {
    const [last] = await this.db
      .select({ rank: cards.rank })
      .from(cards)
      .where(eq(cards.columnId, columnId))
      .orderBy(desc(cards.rank))
      .limit(1);
    return last?.rank ?? null;
  }

  async update(id: string, patch: CardPatch): Promise<Card | null> {
    const [card] = await this.db
      .update(cards)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(cards.id, id))
      .returning();
    return card ?? null;
  }

  async move(id: string, columnId: string, rank: string): Promise<Card | null> {
    const [card] = await this.db
      .update(cards)
      .set({ columnId, rank, updatedAt: new Date() })
      .where(eq(cards.id, id))
      .returning();
    return card ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.delete(cards).where(eq(cards.id, id)).returning({ id: cards.id });
    return deleted.length > 0;
  }
}
