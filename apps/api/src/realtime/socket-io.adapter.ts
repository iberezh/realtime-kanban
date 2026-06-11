import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';

/**
 * Applies the validated CORS_ORIGIN to the Socket.IO handshake. Configuring
 * cors on the @WebSocketGateway decorator instead would read process.env at
 * class-decoration time — before ConfigModule has loaded the .env file.
 */
export class ConfiguredSocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly origin: string,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions): unknown {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.origin },
    } as ServerOptions);
  }
}
