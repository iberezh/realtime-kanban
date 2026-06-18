import type { INestApplication } from '@nestjs/common';
import { io, type Socket } from 'socket.io-client';
import type request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { authedAgent, createTestApp } from './app.harness';

interface PresenceState {
  boardId: string;
  members: Array<{ name: string; color: string }>;
}

function waitFor<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve) => socket.once(event, resolve));
}

describe('Realtime gateway (integration)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;
  let url: string;
  let boardId: string;
  const sockets: Socket[] = [];

  const connect = async (): Promise<Socket> => {
    const socket = io(url, { transports: ['websocket'] });
    sockets.push(socket);
    await waitFor(socket, 'connect');
    return socket;
  };

  beforeAll(async () => {
    app = await createTestApp();
    await app.listen(0);
    url = await app.getUrl();
    agent = await authedAgent(app);

    const { body } = await agent
      .post('/api/v1/boards')
      .send({ title: 'Realtime board' })
      .expect(201);
    boardId = body.id;
  });

  afterAll(async () => {
    for (const socket of sockets) {
      socket.disconnect();
    }
    await app.close();
  });

  it('shares presence and broadcasts domain events to the board room', async () => {
    const ann = await connect();
    const annSeesBob = waitFor<PresenceState>(ann, 'presence:state').then(() =>
      waitFor<PresenceState>(ann, 'presence:state'),
    );
    await ann.emitWithAck('board:join', { boardId, name: 'Ann', color: '#e64980' });

    const bob = await connect();
    const ack = (await bob.emitWithAck('board:join', {
      boardId,
      name: 'Bob',
      color: '#228be6',
    })) as { members: PresenceState['members'] };
    expect(ack.members.map((m) => m.name).sort()).toEqual(['Ann', 'Bob']);
    expect((await annSeesBob).members).toHaveLength(2);

    // A REST mutation must reach both viewers through the event relay.
    const annEvent = waitFor<{ type: string; column: { title: string } }>(ann, 'board:event');
    const bobEvent = waitFor<{ type: string; column: { title: string } }>(bob, 'board:event');
    await agent.post(`/api/v1/boards/${boardId}/columns`).send({ title: 'Todo' }).expect(201);

    for (const event of [await annEvent, await bobEvent]) {
      expect(event.type).toBe('column.created');
      expect(event.column.title).toBe('Todo');
    }

    // Disconnect updates presence for the remaining viewer.
    const annSeesLeave = waitFor<PresenceState>(ann, 'presence:state');
    bob.disconnect();
    expect((await annSeesLeave).members.map((m) => m.name)).toEqual(['Ann']);
  });

  it('rejects invalid join payloads', async () => {
    const socket = await connect();
    const error = waitFor(socket, 'exception');
    socket.emit('board:join', { boardId: 'not-a-uuid', name: '', color: 'nope' });
    expect(await error).toBeDefined();
  });
});
