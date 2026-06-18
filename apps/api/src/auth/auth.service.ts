import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import type { AuthContext, PublicProfile } from './auth.types';
import type { SignupDto } from './dto/signup.dto';

const BCRYPT_ROUNDS = 12;
const AVATAR_COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#dc2626', '#d97706', '#7c3aed'];

function pickColor(email: string): string {
  const index = email.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? '#4f46e5';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<PublicProfile> {
    const existing = await this.repo.findUserByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const { user, account } = await this.repo.createUserWithWorkspace({
      email: dto.email,
      passwordHash,
      name: dto.name,
      color: pickColor(dto.email),
      accountName: dto.accountName,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name, color: user.color },
      account: { id: account.id, name: account.name, plan: account.plan },
    };
  }

  async validate(email: string, password: string): Promise<AuthContext> {
    const user = await this.repo.findUserByEmail(email);
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !valid) throw new UnauthorizedException('Invalid credentials');

    const membership = await this.repo.findMembershipByUser(user.id);
    if (!membership) throw new UnauthorizedException('No workspace found for user');

    return { userId: user.id, accountId: membership.accountId, role: membership.role };
  }

  issueToken(ctx: AuthContext): string {
    return this.jwt.sign({ sub: ctx.userId, accountId: ctx.accountId, role: ctx.role });
  }

  async profileFor(userId: string): Promise<PublicProfile> {
    const user = await this.repo.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const membership = await this.repo.findMembershipByUser(userId);
    if (!membership) throw new UnauthorizedException('No workspace found');

    const account = await this.repo.findAccountById(membership.accountId);
    if (!account) throw new UnauthorizedException('Account not found');

    return {
      user: { id: user.id, email: user.email, name: user.name, color: user.color },
      account: { id: account.id, name: account.name, plan: account.plan },
    };
  }
}
