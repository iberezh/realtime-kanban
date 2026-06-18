import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { type ChecklistItem, cards, checklistItems, columns } from '../../database/schema';

export interface NewChecklistItem {
  cardId: string;
  text: string;
  rank: string;
}

@Injectable()
export class ChecklistRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: NewChecklistItem): Promise<ChecklistItem> {
    const [row] = await this.db.insert(checklistItems).values(input).returning();
    if (!row) {
      throw new Error('Checklist item insert returned no row');
    }
    return row;
  }

  async findById(id: string): Promise<ChecklistItem | null> {
    const [row] = await this.db.select().from(checklistItems).where(eq(checklistItems.id, id));
    return row ?? null;
  }

  async lastRank(cardId: string): Promise<string | null> {
    const [row] = await this.db
      .select({ rank: checklistItems.rank })
      .from(checklistItems)
      .where(eq(checklistItems.cardId, cardId))
      .orderBy(desc(checklistItems.rank))
      .limit(1);
    return row?.rank ?? null;
  }

  async update(
    id: string,
    patch: { text?: string; done?: boolean },
  ): Promise<ChecklistItem | null> {
    const [row] = await this.db
      .update(checklistItems)
      .set(patch)
      .where(eq(checklistItems.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(checklistItems)
      .where(eq(checklistItems.id, id))
      .returning({ id: checklistItems.id });
    return deleted.length > 0;
  }

  /** All checklist items for a board's cards, grouped by card id (for the board view). */
  async byBoard(boardId: string): Promise<Map<string, ChecklistItem[]>> {
    const rows = await this.db
      .select({ item: checklistItems })
      .from(checklistItems)
      .innerJoin(cards, eq(checklistItems.cardId, cards.id))
      .innerJoin(columns, eq(cards.columnId, columns.id))
      .where(eq(columns.boardId, boardId))
      .orderBy(asc(checklistItems.rank));
    const map = new Map<string, ChecklistItem[]>();
    for (const { item } of rows) {
      const list = map.get(item.cardId) ?? [];
      list.push(item);
      map.set(item.cardId, list);
    }
    return map;
  }
}
