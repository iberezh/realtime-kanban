import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { authedAgent, createTestApp } from './app.harness';

describe('Share links (integration)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    agent = await authedAgent(app);
    // Share links are a Pro feature; upgrade (mock checkout) before exercising them.
    await agent.post('/api/v1/billing/checkout').send({ plan: 'pro' }).expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves a board read-only through a token, then 404s once revoked', async () => {
    const { body: board } = await agent
      .post('/api/v1/boards')
      .send({ title: 'Shared board' })
      .expect(201);
    const { body: column } = await agent
      .post(`/api/v1/boards/${board.id}/columns`)
      .send({ title: 'Todo' })
      .expect(201);
    await agent
      .post(`/api/v1/columns/${column.id}/cards`)
      .send({ title: 'Public card' })
      .expect(201);

    const { body: link } = await agent.post(`/api/v1/boards/${board.id}/share-links`).expect(201);
    expect(link.token).toEqual(expect.any(String));

    // A guest (no session cookie) can read the board through the token.
    const guest = request(app.getHttpServer());
    const { body: view } = await guest.get(`/api/v1/share/${link.token}`).expect(200);
    expect(view.id).toBe(board.id);
    expect(view.columns[0].cards[0].title).toBe('Public card');
    expect(Array.isArray(view.labels)).toBe(true);

    // Unknown tokens never resolve.
    await guest.get('/api/v1/share/does-not-exist').expect(404);

    // Revoking kills the link.
    await agent.delete(`/api/v1/share-links/${link.id}`).expect(204);
    await guest.get(`/api/v1/share/${link.token}`).expect(404);
  });

  it('accepts a future expiry and rejects a past one', async () => {
    const { body: board } = await agent
      .post('/api/v1/boards')
      .send({ title: 'Expiring board' })
      .expect(201);

    const future = new Date(Date.now() + 86_400_000).toISOString();
    const { body: link } = await agent
      .post(`/api/v1/boards/${board.id}/share-links`)
      .send({ expiresAt: future })
      .expect(201);
    expect(new Date(link.expiresAt).toISOString()).toBe(future);

    await agent
      .post(`/api/v1/boards/${board.id}/share-links`)
      .send({ expiresAt: '2020-01-01T00:00:00.000Z' })
      .expect(400);
  });

  it('rejects share-link management without a session', async () => {
    const { body: board } = await agent
      .post('/api/v1/boards')
      .send({ title: 'Guarded board' })
      .expect(201);
    await request(app.getHttpServer()).post(`/api/v1/boards/${board.id}/share-links`).expect(401);
  });
});
