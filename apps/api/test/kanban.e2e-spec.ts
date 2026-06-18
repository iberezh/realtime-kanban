import type { INestApplication } from '@nestjs/common';
import type request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { authedAgent, createTestApp } from './app.harness';

describe('Kanban API (integration)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    agent = await authedAgent(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs the full board lifecycle', async () => {
    const { body: board } = await agent
      .post('/api/v1/boards')
      .send({ title: 'Integration board' })
      .expect(201);

    const { body: todo } = await agent
      .post(`/api/v1/boards/${board.id}/columns`)
      .send({ title: 'Todo' })
      .expect(201);
    const { body: doing } = await agent
      .post(`/api/v1/boards/${board.id}/columns`)
      .send({ title: 'Doing' })
      .expect(201);

    // WIP limit round-trips and can be cleared.
    const { body: limited } = await agent
      .patch(`/api/v1/columns/${doing.id}/wip-limit`)
      .send({ wipLimit: 2 })
      .expect(200);
    expect(limited.wipLimit).toBe(2);
    const { body: cleared } = await agent
      .patch(`/api/v1/columns/${doing.id}/wip-limit`)
      .send({ wipLimit: null })
      .expect(200);
    expect(cleared.wipLimit).toBeNull();

    const { body: cardA } = await agent
      .post(`/api/v1/columns/${todo.id}/cards`)
      .send({ title: 'A' })
      .expect(201);
    const { body: cardB } = await agent
      .post(`/api/v1/columns/${todo.id}/cards`)
      .send({ title: 'B' })
      .expect(201);

    // Move B into Doing, then A before B — final order in Doing: [A, B].
    await agent.post(`/api/v1/cards/${cardB.id}/move`).send({ toColumnId: doing.id }).expect(200);
    await agent
      .post(`/api/v1/cards/${cardA.id}/move`)
      .send({ toColumnId: doing.id, beforeCardId: cardB.id })
      .expect(200);

    const { body: view } = await agent.get(`/api/v1/boards/${board.id}`).expect(200);
    const doingColumn = view.columns.find((column: { id: string }) => column.id === doing.id);
    expect(doingColumn.cards.map((card: { title: string }) => card.title)).toEqual(['A', 'B']);
    const todoColumn = view.columns.find((column: { id: string }) => column.id === todo.id);
    expect(todoColumn.cards).toHaveLength(0);

    // Validation guardrails.
    await agent.post('/api/v1/boards').send({ title: '' }).expect(400);
    await agent
      .post(`/api/v1/cards/${cardA.id}/move`)
      .send({ toColumnId: doing.id, beforeCardId: cardA.id })
      .expect(400);

    await agent.delete(`/api/v1/boards/${board.id}`).expect(204);
    await agent.get(`/api/v1/boards/${board.id}`).expect(404);
  });

  it("forbids changing another account's column WIP limit", async () => {
    const { body: board } = await agent
      .post('/api/v1/boards')
      .send({ title: 'Owned board' })
      .expect(201);
    const { body: column } = await agent
      .post(`/api/v1/boards/${board.id}/columns`)
      .send({ title: 'Todo' })
      .expect(201);

    const intruder = await authedAgent(app);
    await intruder
      .patch(`/api/v1/columns/${column.id}/wip-limit`)
      .send({ wipLimit: 5 })
      .expect(403);
  });
});
