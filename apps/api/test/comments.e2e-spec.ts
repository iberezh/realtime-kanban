import type { INestApplication } from '@nestjs/common';
import type request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { authedAgent, createTestApp } from './app.harness';

describe('Comments API (integration)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;
  let cardId: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    agent = await authedAgent(app);

    // Business plan removes the board cap.
    await agent.post('/api/v1/billing/checkout').send({ plan: 'business' }).expect(200);

    const { body: board } = await agent
      .post('/api/v1/boards')
      .send({ title: 'Comment board' })
      .expect(201);
    const { body: column } = await agent
      .post(`/api/v1/boards/${board.id}/columns`)
      .send({ title: 'Todo' })
      .expect(201);
    const { body: card } = await agent
      .post(`/api/v1/columns/${column.id}/cards`)
      .send({ title: 'Commented card' })
      .expect(201);
    cardId = card.id;

    const { body: members } = await agent.get('/api/v1/members').expect(200);
    userId = (members as Array<{ userId: string }>)[0]?.userId ?? '';
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a comment and GET returns it with authorName', async () => {
    const { body: comment } = await agent
      .post(`/api/v1/cards/${cardId}/comments`)
      .send({ body: 'First comment' })
      .expect(201);

    expect(comment).toMatchObject({
      id: expect.any(String),
      cardId,
      body: 'First comment',
      authorName: expect.any(String),
      authorColor: expect.any(String),
    });

    const { body: list } = await agent.get(`/api/v1/cards/${cardId}/comments`).expect(200);
    expect(list).toHaveLength(1);
    expect((list as Array<{ body: string; authorName: string }>)[0]?.body).toBe('First comment');
    expect((list as Array<{ body: string; authorName: string }>)[0]?.authorName).toBeTruthy();
  });

  it('returns 400 when body is empty', async () => {
    await agent.post(`/api/v1/cards/${cardId}/comments`).send({ body: '' }).expect(400);
  });

  it('returns 400 when body exceeds 2000 chars', async () => {
    await agent
      .post(`/api/v1/cards/${cardId}/comments`)
      .send({ body: 'a'.repeat(2001) })
      .expect(400);
  });

  it('forbids a different account from posting a comment', async () => {
    const intruder = await authedAgent(app);
    await intruder.post(`/api/v1/cards/${cardId}/comments`).send({ body: 'hacked' }).expect(403);
  });

  it('forbids a different account from reading comments', async () => {
    const intruder = await authedAgent(app);
    await intruder.get(`/api/v1/cards/${cardId}/comments`).expect(403);
  });

  it('does NOT create a notification when mentioning own userId', async () => {
    await agent
      .post(`/api/v1/cards/${cardId}/comments`)
      .send({ body: 'mentioning myself', mentionedUserIds: [userId] })
      .expect(201);

    const { body: notifs } = await agent.get('/api/v1/notifications').expect(200);
    expect(notifs).toHaveLength(0);
  });

  it('GET /notifications/unread-count returns { count: 0 }', async () => {
    const { body } = await agent.get('/api/v1/notifications/unread-count').expect(200);
    expect(body).toEqual({ count: 0 });
  });

  it('POST /notifications/read returns 204', async () => {
    await agent.post('/api/v1/notifications/read').expect(204);
  });

  it('deletes own comment', async () => {
    const { body: comment } = await agent
      .post(`/api/v1/cards/${cardId}/comments`)
      .send({ body: 'delete me' })
      .expect(201);

    await agent.delete(`/api/v1/comments/${comment.id}`).expect(204);

    const { body: list } = await agent.get(`/api/v1/cards/${cardId}/comments`).expect(200);
    expect((list as Array<{ id: string }>).find((c) => c.id === comment.id)).toBeUndefined();
  });

  it('forbids deleting another account comment', async () => {
    const { body: comment } = await agent
      .post(`/api/v1/cards/${cardId}/comments`)
      .send({ body: 'mine' })
      .expect(201);

    const intruder = await authedAgent(app);
    await intruder.delete(`/api/v1/comments/${comment.id}`).expect(403);
  });
});
