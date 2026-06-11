import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';

describe('Kanban API (integration)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs the full board lifecycle', async () => {
    const { body: board } = await http
      .post('/api/boards')
      .send({ title: 'Integration board' })
      .expect(201);

    const { body: todo } = await http
      .post(`/api/boards/${board.id}/columns`)
      .send({ title: 'Todo' })
      .expect(201);
    const { body: doing } = await http
      .post(`/api/boards/${board.id}/columns`)
      .send({ title: 'Doing' })
      .expect(201);

    const { body: cardA } = await http
      .post(`/api/columns/${todo.id}/cards`)
      .send({ title: 'A' })
      .expect(201);
    const { body: cardB } = await http
      .post(`/api/columns/${todo.id}/cards`)
      .send({ title: 'B' })
      .expect(201);

    // Move B into Doing, then A before B — final order in Doing: [A, B].
    await http.post(`/api/cards/${cardB.id}/move`).send({ toColumnId: doing.id }).expect(200);
    await http
      .post(`/api/cards/${cardA.id}/move`)
      .send({ toColumnId: doing.id, beforeCardId: cardB.id })
      .expect(200);

    const { body: view } = await http.get(`/api/boards/${board.id}`).expect(200);
    const doingColumn = view.columns.find((column: { id: string }) => column.id === doing.id);
    expect(doingColumn.cards.map((card: { title: string }) => card.title)).toEqual(['A', 'B']);
    const todoColumn = view.columns.find((column: { id: string }) => column.id === todo.id);
    expect(todoColumn.cards).toHaveLength(0);

    // Validation guardrails.
    await http.post('/api/boards').send({ title: '' }).expect(400);
    await http
      .post(`/api/cards/${cardA.id}/move`)
      .send({ toColumnId: doing.id, beforeCardId: cardA.id })
      .expect(400);

    await http.delete(`/api/boards/${board.id}`).expect(204);
    await http.get(`/api/boards/${board.id}`).expect(404);
  });
});
