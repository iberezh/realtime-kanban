import type { INestApplication } from '@nestjs/common';
import type request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { authedAgent, createTestApp } from './app.harness';

describe('Billing + plan gating (integration, mock mode)', () => {
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

  it('starts on free, gates the 2nd board, and lifts the gate after upgrade', async () => {
    const { body: status } = await agent.get('/api/v1/billing/status').expect(200);
    expect(status.plan).toBe('free');
    expect(status.mode).toBe('mock');
    expect(status.limits.boards).toBe(1);

    // First board is allowed; the second exceeds the free limit.
    await agent.post('/api/v1/boards').send({ title: 'First' }).expect(201);
    await agent.post('/api/v1/boards').send({ title: 'Second' }).expect(403);

    // Mock checkout flips the plan and returns an in-app return URL.
    const { body: checkout } = await agent
      .post('/api/v1/billing/checkout')
      .send({ plan: 'pro' })
      .expect(200);
    expect(checkout.url).toContain('/app');

    const { body: upgraded } = await agent.get('/api/v1/billing/status').expect(200);
    expect(upgraded.plan).toBe('pro');

    // Pro allows more boards.
    await agent.post('/api/v1/boards').send({ title: 'Second' }).expect(201);
  });

  it('rejects an invalid checkout plan', async () => {
    await agent.post('/api/v1/billing/checkout').send({ plan: 'enterprise' }).expect(400);
  });
});
