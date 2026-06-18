import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_COOKIE } from './auth.constants';
import type { AuthContext } from './auth.types';

interface JwtPayload {
  sub: string;
  accountId: string;
  role: 'owner' | 'member';
}

function cookieExtractor(req: Request): string | null {
  return (req.cookies as Record<string, string | undefined>)[AUTH_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthContext {
    return { userId: payload.sub, accountId: payload.accountId, role: payload.role };
  }
}
