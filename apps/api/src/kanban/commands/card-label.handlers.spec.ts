import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { EventBus } from '@nestjs/cqrs';
import { describe, expect, it, vi } from 'vitest';
import type { Board, Card, Label } from '../../database/schema';
import type { LabelsRepository } from '../../labels/labels.repository';
import { CardLabelAttachedEvent, CardLabelDetachedEvent } from '../events/kanban.events';
import type { BoardsRepository } from '../repositories/boards.repository';
import type { CardLabelsRepository } from '../repositories/card-labels.repository';
import type { CardsRepository } from '../repositories/cards.repository';
import { AttachLabelCommand, DetachLabelCommand } from './card-label.commands';
import { AttachLabelHandler, DetachLabelHandler } from './card-label.handlers';

const ACCOUNT = 'acct-1';
const ACTOR = 'actor-1';
const CARD_ID = 'card-1';
const LABEL_ID = 'label-1';

const makeCard = (): Card => ({
  id: CARD_ID,
  columnId: 'col-1',
  title: 'Test',
  description: null,
  assigneeId: null,
  dueAt: null,
  rank: 'm',
  createdAt: new Date(),
  updatedAt: new Date(),
});
const makeBoard = (accountId = ACCOUNT): Board => ({
  id: 'board-1',
  accountId,
  title: 'Board',
  createdAt: new Date(),
});
const makeLabel = (accountId = ACCOUNT): Label => ({
  id: LABEL_ID,
  accountId,
  name: 'Bug',
  color: '#ef4444',
  createdAt: new Date(),
});

interface Overrides {
  card?: Card | null;
  board?: Board | null;
  label?: Label | null;
}

function makeRepos(overrides: Overrides) {
  const attach = vi.fn(async () => undefined);
  const detach = vi.fn(async () => undefined);
  const publish = vi.fn();
  const cards = {
    findById: vi.fn(async () => (overrides.card === undefined ? makeCard() : overrides.card)),
  } as unknown as CardsRepository;
  const boards = {
    findByColumnId: vi.fn(async () =>
      overrides.board === undefined ? makeBoard() : overrides.board,
    ),
  } as unknown as BoardsRepository;
  const cardLabels = { attach, detach } as unknown as CardLabelsRepository;
  const labels = {
    findById: vi.fn(async () => (overrides.label === undefined ? makeLabel() : overrides.label)),
  } as unknown as LabelsRepository;
  return {
    cards,
    boards,
    cardLabels,
    labels,
    eventBus: { publish } as unknown as EventBus,
    publish,
    attach,
    detach,
  };
}

const attachCmd = new AttachLabelCommand(CARD_ID, LABEL_ID, ACCOUNT, ACTOR);
const detachCmd = new DetachLabelCommand(CARD_ID, LABEL_ID, ACCOUNT, ACTOR);
const attachHandler = (o: Overrides) => {
  const r = makeRepos(o);
  return { run: new AttachLabelHandler(r.cards, r.boards, r.cardLabels, r.labels, r.eventBus), r };
};
const detachHandler = (o: Overrides) => {
  const r = makeRepos(o);
  return { run: new DetachLabelHandler(r.cards, r.boards, r.cardLabels, r.labels, r.eventBus), r };
};

describe('AttachLabelHandler', () => {
  it('throws NotFound when the card is missing', async () => {
    await expect(attachHandler({ card: null }).run.execute(attachCmd)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('throws Forbidden when the board is on another account', async () => {
    await expect(
      attachHandler({ board: makeBoard('other') }).run.execute(attachCmd),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('throws NotFound when the label is missing', async () => {
    await expect(attachHandler({ label: null }).run.execute(attachCmd)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('throws Forbidden when the label is on another account', async () => {
    await expect(
      attachHandler({ label: makeLabel('other') }).run.execute(attachCmd),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('attaches and publishes on the happy path', async () => {
    const { run, r } = attachHandler({});
    await run.execute(attachCmd);
    expect(r.attach).toHaveBeenCalledWith(CARD_ID, LABEL_ID);
    expect(r.publish).toHaveBeenCalledWith(expect.any(CardLabelAttachedEvent));
  });
});

describe('DetachLabelHandler', () => {
  it('throws NotFound when the card is missing', async () => {
    await expect(detachHandler({ card: null }).run.execute(detachCmd)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('throws Forbidden when the board is on another account', async () => {
    await expect(
      detachHandler({ board: makeBoard('other') }).run.execute(detachCmd),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('detaches and publishes on the happy path', async () => {
    const { run, r } = detachHandler({});
    await run.execute(detachCmd);
    expect(r.detach).toHaveBeenCalledWith(CARD_ID, LABEL_ID);
    expect(r.publish).toHaveBeenCalledWith(expect.any(CardLabelDetachedEvent));
  });
});
