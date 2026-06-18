import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { type Comment, comments, users } from '../../database/schema';

export interface CommentView {
  id: string;
  cardId: string;
  authorId: string | null;
  authorName: string;
  authorColor: string;
  body: string;
  createdAt: Date;
}

export interface NewComment {
  cardId: string;
  authorId: string;
  body: string;
}

const UNKNOWN_NAME = 'Unknown';
const UNKNOWN_COLOR = '#adb5bd';

const viewSelect = {
  id: comments.id,
  cardId: comments.cardId,
  authorId: comments.authorId,
  authorName: users.name,
  authorColor: users.color,
  body: comments.body,
  createdAt: comments.createdAt,
} as const;

function toView(r: {
  id: string;
  cardId: string;
  authorId: string | null;
  authorName: string | null;
  authorColor: string | null;
  body: string;
  createdAt: Date;
}): CommentView {
  return {
    id: r.id,
    cardId: r.cardId,
    authorId: r.authorId,
    authorName: r.authorName ?? UNKNOWN_NAME,
    authorColor: r.authorColor ?? UNKNOWN_COLOR,
    body: r.body,
    createdAt: r.createdAt,
  };
}

@Injectable()
export class CommentsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: NewComment): Promise<Comment> {
    const [row] = await this.db.insert(comments).values(input).returning();
    if (!row) throw new Error('Comment insert returned no row');
    return row;
  }

  async findById(id: string): Promise<Comment | null> {
    const [row] = await this.db.select().from(comments).where(eq(comments.id, id));
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });
    return deleted.length > 0;
  }

  async listByCard(cardId: string): Promise<CommentView[]> {
    const rows = await this.db
      .select(viewSelect)
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.cardId, cardId))
      .orderBy(asc(comments.createdAt));
    return rows.map(toView);
  }

  async findViewById(id: string): Promise<CommentView | null> {
    const [r] = await this.db
      .select(viewSelect)
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.id, id));
    return r ? toView(r) : null;
  }
}
