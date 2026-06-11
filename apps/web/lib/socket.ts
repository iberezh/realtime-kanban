import { io, type Socket } from 'socket.io-client';
import { API_URL } from './api';

let socket: Socket | null = null;

/** One shared connection; the socket server lives on the API origin (without the /api path). */
export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    throw new Error('getSocket() is client-only');
  }
  if (!socket) {
    socket = io(new URL(API_URL).origin, { transports: ['websocket'] });
  }
  return socket;
}
