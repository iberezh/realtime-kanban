import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Board, ShareLink } from '../database/schema';
import type { BoardsRepository } from '../kanban/repositories/boards.repository';
import { CreateShareLinkHandler, RevokeShareLinkHandler } from './share.command-handlers';
import { CreateShareLinkCommand, RevokeShareLinkCommand } from './share.commands';
import type { ShareLinkRepository } from './share-link.repository';

const ACCOUNT = 'acct-1';
const USER = 'user-1';
const BOARD_ID = 'board-1';

const board = (accountId = ACCOUNT): Board => ({
  id: BOARD_ID,
  accountId,
  title: 'Board',
  createdAt: new Date(),
});
const link = (): ShareLink => ({
  id: 'link-1',
  boardId: BOARD_ID,
  token: 'tok',
  createdBy: USER,
  createdAt: new Date(),
});

function makeRepos(overrides: { board?: Board | null; link?: ShareLink | null }) {
  const create = vi.fn(async () => link());
  const del = vi.fn(async () => true);
  const boards = {
    findById: vi.fn(async () => (overrides.board === undefined ? board() : overrides.board)),
  } as unknown as BoardsRepository;
  const shareLinks = {
    create,
    delete: del,
    findById: vi.fn(async () => (overrides.link === undefined ? link() : overrides.link)),
  } as unknown as ShareLinkRepository;
  return { boards, shareLinks, create, del };
}

describe('CreateShareLinkHandler', () => {
  const cmd = new CreateShareLinkCommand(BOARD_ID, ACCOUNT, USER);

  it('throws NotFound when the board is missing', async () => {
    const r = makeRepos({ board: null });
    await expect(
      new CreateShareLinkHandler(r.boards, r.shareLinks).execute(cmd),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws Forbidden for another account's board", async () => {
    const r = makeRepos({ board: board('intruder') });
    await expect(
      new CreateShareLinkHandler(r.boards, r.shareLinks).execute(cmd),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(r.create).not.toHaveBeenCalled();
  });

  it('creates a tokened link on the happy path', async () => {
    const r = makeRepos({});
    await new CreateShareLinkHandler(r.boards, r.shareLinks).execute(cmd);
    expect(r.create).toHaveBeenCalledWith(
      expect.objectContaining({ boardId: BOARD_ID, createdBy: USER, token: expect.any(String) }),
    );
  });
});

describe('RevokeShareLinkHandler', () => {
  const cmd = new RevokeShareLinkCommand('link-1', ACCOUNT);

  it('throws NotFound when the link is missing', async () => {
    const r = makeRepos({ link: null });
    await expect(
      new RevokeShareLinkHandler(r.boards, r.shareLinks).execute(cmd),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws Forbidden when the board belongs to another account', async () => {
    const r = makeRepos({ board: board('intruder') });
    await expect(
      new RevokeShareLinkHandler(r.boards, r.shareLinks).execute(cmd),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(r.del).not.toHaveBeenCalled();
  });

  it('deletes the link on the happy path', async () => {
    const r = makeRepos({});
    await new RevokeShareLinkHandler(r.boards, r.shareLinks).execute(cmd);
    expect(r.del).toHaveBeenCalledWith('link-1');
  });
});
