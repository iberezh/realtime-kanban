import { type INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, type ServerOptions } from 'socket.io';

const logger = new Logger('SocketIoRedisAdapter');

/**
 * Applies the validated CORS_ORIGIN to the Socket.IO handshake. Configuring
 * cors on the @WebSocketGateway decorator instead would read process.env at
 * class-decoration time — before ConfigModule has loaded the .env file.
 *
 * When REDIS_URL is set, instances share rooms and presence through the Redis
 * adapter so the gateway scales horizontally; otherwise it stays single-node.
 */
export class ConfiguredSocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly origin: string,
    private readonly redisUrl?: string,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions): unknown {
    const server = super.createIOServer(port, {
      ...options,
      cors: { origin: this.origin },
    } as ServerOptions) as Server;
    if (this.redisUrl) {
      const pub = new Redis(this.redisUrl);
      const sub = pub.duplicate();
      // Without an error listener an ioredis connection error is an unhandled
      // 'error' event that would crash the process; log and let it reconnect.
      const onError = (error: Error): void => logger.error(error.message);
      pub.on('error', onError);
      sub.on('error', onError);
      server.adapter(createAdapter(pub, sub));
    }
    return server;
  }
}
