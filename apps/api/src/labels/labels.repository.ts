import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../database/database.module';
import { type Label, labels } from '../database/schema';

export interface NewLabel {
  accountId: string;
  name: string;
  color: string;
}

@Injectable()
export class LabelsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: NewLabel): Promise<Label> {
    const [label] = await this.db.insert(labels).values(input).returning();
    if (!label) throw new Error('Label insert returned no row');
    return label;
  }

  async findById(id: string): Promise<Label | null> {
    const [label] = await this.db.select().from(labels).where(eq(labels.id, id));
    return label ?? null;
  }

  async listByAccount(accountId: string): Promise<Label[]> {
    return this.db.select().from(labels).where(eq(labels.accountId, accountId));
  }

  async rename(id: string, name: string): Promise<Label | null> {
    const [label] = await this.db.update(labels).set({ name }).where(eq(labels.id, id)).returning();
    return label ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(labels)
      .where(eq(labels.id, id))
      .returning({ id: labels.id });
    return deleted.length > 0;
  }
}
