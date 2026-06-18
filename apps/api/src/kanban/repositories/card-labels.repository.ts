import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { cardLabels, cards, columns } from '../../database/schema';

@Injectable()
export class CardLabelsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async attach(cardId: string, labelId: string): Promise<void> {
    await this.db.insert(cardLabels).values({ cardId, labelId }).onConflictDoNothing();
  }

  async detach(cardId: string, labelId: string): Promise<void> {
    await this.db
      .delete(cardLabels)
      .where(and(eq(cardLabels.cardId, cardId), eq(cardLabels.labelId, labelId)));
  }

  async listLabelIdsByCard(cardId: string): Promise<string[]> {
    const rows = await this.db
      .select({ labelId: cardLabels.labelId })
      .from(cardLabels)
      .where(eq(cardLabels.cardId, cardId));
    return rows.map((r) => r.labelId);
  }

  async labelIdsByBoard(boardId: string): Promise<Map<string, string[]>> {
    const rows = await this.db
      .select({ cardId: cardLabels.cardId, labelId: cardLabels.labelId })
      .from(cardLabels)
      .innerJoin(cards, eq(cardLabels.cardId, cards.id))
      .innerJoin(columns, eq(cards.columnId, columns.id))
      .where(eq(columns.boardId, boardId));
    const map = new Map<string, string[]>();
    for (const row of rows) {
      const existing = map.get(row.cardId) ?? [];
      existing.push(row.labelId);
      map.set(row.cardId, existing);
    }
    return map;
  }
}
