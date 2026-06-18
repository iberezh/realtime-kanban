import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { EventBus } from '@nestjs/cqrs';
import { describe, expect, it, vi } from 'vitest';
import type { Board, Card, Comment } from '../../database/schema';
import type { NotificationsRepository } from '../../notifications/notifications.repository';
import { CommentCreatedEvent, CommentDeletedEvent } from '../events/kanban.events';
import type { BoardsRepository } from '../repositories/boards.repository';
import type { CardsRepository } from '../repositories/cards.repository';
import type { CommentsRepository, CommentView } from '../repositories/comments.repository';
import type { MembersRepository } from '../repositories/members.repository';
import { CreateCommentCommand, DeleteCommentCommand } from './comment.commands';
import { CreateCommentHandler, DeleteCommentHandler } from './comment.handlers';

const ACCOUNT = 'acct-1';
const ACTOR = 'user-1';
const CARD_ID = 'card-1';
const COMMENT_ID = 'comment-1';
const BOARD_ID = 'board-1';
const MEMBER_ID = 'user-2';

const makeCard = (): Card => ({
  id: CARD_ID,
  columnId: 'col-1',
  title: 'T',
  description: null,
  assigneeId: null,
  dueAt: null,
  rank: 'm',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeBoard = (accountId = ACCOUNT): Board => ({
  id: BOARD_ID,
  accountId,
  title: 'B',
  createdAt: new Date(),
});

const makeRawComment = (authorId = ACTOR): Comment => ({
  id: COMMENT_ID,
  cardId: CARD_ID,
  authorId,
  body: 'hello',
  createdAt: new Date(),
});

const makeView = (authorId: string | null = ACTOR): CommentView => ({
  id: COMMENT_ID,
  cardId: CARD_ID,
  authorId,
  authorName: 'Test User',
  authorColor: '#123456',
  body: 'hello',
  createdAt: new Date(),
});

interface CreateOverrides {
  card?: Card | null;
  board?: Board | null;
  view?: CommentView | null;
  isMember?: boolean;
}

function makeCreateDeps(o: CreateOverrides = {}) {
  const publish = vi.fn();
  const createNotif = vi.fn();
  const cards = {
    findById: vi.fn(async () => (o.card === undefined ? makeCard() : o.card)),
  } as unknown as CardsRepository;
  const boards = {
    findByColumnId: vi.fn(async () => (o.board === undefined ? makeBoard() : o.board)),
  } as unknown as BoardsRepository;
  const raw = makeRawComment();
  const commentsRepo = {
    create: vi.fn(async () => raw),
    findViewById: vi.fn(async () => (o.view === undefined ? makeView() : o.view)),
  } as unknown as CommentsRepository;
  const members = {
    isMember: vi.fn(async () => (o.isMember === undefined ? true : o.isMember)),
  } as unknown as MembersRepository;
  const notificationsRepo = { create: createNotif } as unknown as NotificationsRepository;
  const eventBus = { publish } as unknown as EventBus;
  return {
    cards,
    boards,
    commentsRepo,
    members,
    notificationsRepo,
    eventBus,
    publish,
    createNotif,
  };
}

function makeCreateHandler(o: CreateOverrides = {}) {
  const d = makeCreateDeps(o);
  return {
    run: new CreateCommentHandler(
      d.cards,
      d.boards,
      d.commentsRepo,
      d.members,
      d.notificationsRepo,
      d.eventBus,
    ),
    d,
  };
}

interface DeleteOverrides {
  comment?: Comment | null;
  board?: Board | null;
}

function makeDeleteDeps(o: DeleteOverrides = {}) {
  const publish = vi.fn();
  const cards = { findById: vi.fn(async () => makeCard()) } as unknown as CardsRepository;
  const boards = {
    findByColumnId: vi.fn(async () => (o.board === undefined ? makeBoard() : o.board)),
  } as unknown as BoardsRepository;
  const commentsRepo = {
    findById: vi.fn(async () => (o.comment === undefined ? makeRawComment() : o.comment)),
    delete: vi.fn(async () => true),
  } as unknown as CommentsRepository;
  const eventBus = { publish } as unknown as EventBus;
  return { cards, boards, commentsRepo, eventBus, publish };
}

function makeDeleteHandler(o: DeleteOverrides = {}) {
  const d = makeDeleteDeps(o);
  return { run: new DeleteCommentHandler(d.cards, d.boards, d.commentsRepo, d.eventBus), d };
}

describe('CreateCommentHandler', () => {
  it('throws Forbidden when card belongs to another account', async () => {
    const cmd = new CreateCommentCommand(CARD_ID, 'hi', [], ACCOUNT, ACTOR);
    await expect(
      makeCreateHandler({ board: makeBoard('other') }).run.execute(cmd),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('publishes CommentCreatedEvent on happy path', async () => {
    const cmd = new CreateCommentCommand(CARD_ID, 'hi', [], ACCOUNT, ACTOR);
    const { run, d } = makeCreateHandler();
    await run.execute(cmd);
    expect(d.publish).toHaveBeenCalledWith(expect.any(CommentCreatedEvent));
  });

  it('creates notification for mentioned member who is not the author', async () => {
    const cmd = new CreateCommentCommand(CARD_ID, 'hi', [MEMBER_ID], ACCOUNT, ACTOR);
    const { run, d } = makeCreateHandler({ isMember: true });
    await run.execute(cmd);
    expect(d.createNotif).toHaveBeenCalledOnce();
    const [arg] = d.createNotif.mock.calls[0] ?? [];
    expect((arg as { userId: string }).userId).toBe(MEMBER_ID);
    expect((arg as { type: string }).type).toBe('mention');
  });

  it('does NOT notify when mentionedId equals author', async () => {
    const cmd = new CreateCommentCommand(CARD_ID, 'hi', [ACTOR], ACCOUNT, ACTOR);
    const { run, d } = makeCreateHandler({ isMember: true });
    await run.execute(cmd);
    expect(d.createNotif).not.toHaveBeenCalled();
  });

  it('does NOT notify when mentioned user is not a member', async () => {
    const cmd = new CreateCommentCommand(CARD_ID, 'hi', [MEMBER_ID], ACCOUNT, ACTOR);
    const { run, d } = makeCreateHandler({ isMember: false });
    await run.execute(cmd);
    expect(d.createNotif).not.toHaveBeenCalled();
  });
});

describe('DeleteCommentHandler', () => {
  it('throws NotFound when comment is missing', async () => {
    const cmd = new DeleteCommentCommand(COMMENT_ID, ACCOUNT, ACTOR);
    await expect(makeDeleteHandler({ comment: null }).run.execute(cmd)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws Forbidden when board is on another account', async () => {
    const cmd = new DeleteCommentCommand(COMMENT_ID, ACCOUNT, ACTOR);
    await expect(
      makeDeleteHandler({ board: makeBoard('other') }).run.execute(cmd),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws Forbidden when caller is not the comment author', async () => {
    const cmd = new DeleteCommentCommand(COMMENT_ID, ACCOUNT, 'other-user');
    await expect(makeDeleteHandler().run.execute(cmd)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('publishes CommentDeletedEvent on happy path', async () => {
    const cmd = new DeleteCommentCommand(COMMENT_ID, ACCOUNT, ACTOR);
    const { run, d } = makeDeleteHandler();
    await run.execute(cmd);
    expect(d.publish).toHaveBeenCalledWith(expect.any(CommentDeletedEvent));
  });
});
