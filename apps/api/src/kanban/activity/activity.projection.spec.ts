import { describe, expect, it, vi } from 'vitest';
import type { Card } from '../../database/schema';
import { CardCreatedEvent } from '../events/kanban.events';
import type { ActivityRepository } from '../repositories/activity.repository';
import { ActivityProjection } from './activity.projection';

const makeCard = (): Card => ({
  id: 'card-1',
  columnId: 'col-1',
  title: 'Test',
  description: null,
  assigneeId: null,
  dueAt: null,
  rank: 'm',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('ActivityProjection', () => {
  it('inserts an activity row for CardCreatedEvent', async () => {
    const insert = vi.fn(async () => undefined);
    const activityRepo = { insert } as unknown as ActivityRepository;
    const projection = new ActivityProjection(activityRepo);

    const event = new CardCreatedEvent('board-1', makeCard(), 'actor-1');
    await projection.handle(event);

    expect(insert).toHaveBeenCalledWith({
      boardId: 'board-1',
      actorId: 'actor-1',
      type: 'CardCreatedEvent',
      data: {},
    });
  });
});
