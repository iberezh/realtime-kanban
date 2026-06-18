import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { describe, expect, it, vi } from 'vitest';
import type { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import type { SignupDto } from './dto/signup.dto';

const fakeAccount = { id: 'acc-1', name: 'Acme', plan: 'free' as const };
const fakeUser = {
  id: 'usr-1',
  email: 'alice@example.com',
  name: 'Alice',
  color: '#4f46e5',
  passwordHash: '',
  createdAt: new Date(),
};

function buildRepo(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    findUserByEmail: vi.fn(async () => null),
    findById: vi.fn(async () => fakeUser),
    findAccountById: vi.fn(async () => ({
      ...fakeAccount,
      lemonCustomerId: null,
      lemonSubscriptionId: null,
      createdAt: new Date(),
    })),
    createUserWithWorkspace: vi.fn(async () => ({
      user: fakeUser,
      account: {
        ...fakeAccount,
        lemonCustomerId: null,
        lemonSubscriptionId: null,
        createdAt: new Date(),
      },
      role: 'owner' as const,
    })),
    findMembershipByUser: vi.fn(async () => ({ accountId: 'acc-1', role: 'owner' as const })),
    ...overrides,
  } as unknown as AuthRepository;
}

const stubJwt = { sign: vi.fn(() => 'test-token') } as unknown as JwtService;

const signupDto: SignupDto = {
  email: 'alice@example.com',
  password: 'password123',
  name: 'Alice',
  accountName: 'Acme',
};

describe('AuthService.signup', () => {
  it('hashes the password and returns a PublicProfile', async () => {
    const repo = buildRepo();
    const service = new AuthService(repo, stubJwt);
    const profile = await service.signup(signupDto);

    expect(repo.createUserWithWorkspace).toHaveBeenCalledOnce();
    const [input] = (repo.createUserWithWorkspace as ReturnType<typeof vi.fn>).mock.calls[0] as [
      Parameters<AuthRepository['createUserWithWorkspace']>[0],
    ];
    expect(input.passwordHash).not.toBe(signupDto.password);
    expect(input.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(profile.user.email).toBe('alice@example.com');
    expect(profile.account.name).toBe('Acme');
  });

  it('throws ConflictException when email is already taken', async () => {
    const repo = buildRepo({ findUserByEmail: vi.fn(async () => fakeUser) });
    const service = new AuthService(repo, stubJwt);
    await expect(service.signup(signupDto)).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('AuthService.validate', () => {
  it('throws UnauthorizedException for wrong password', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('correct', 12);
    const repo = buildRepo({
      findUserByEmail: vi.fn(async () => ({ ...fakeUser, passwordHash: hash })),
    });
    const service = new AuthService(repo, stubJwt);
    await expect(service.validate('alice@example.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns AuthContext for correct credentials', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('secret', 12);
    const repo = buildRepo({
      findUserByEmail: vi.fn(async () => ({ ...fakeUser, passwordHash: hash })),
    });
    const service = new AuthService(repo, stubJwt);
    const ctx = await service.validate('alice@example.com', 'secret');
    expect(ctx.userId).toBe('usr-1');
    expect(ctx.accountId).toBe('acc-1');
    expect(ctx.role).toBe('owner');
  });

  it('throws UnauthorizedException for unknown email', async () => {
    const repo = buildRepo({ findUserByEmail: vi.fn(async () => null) });
    const service = new AuthService(repo, stubJwt);
    await expect(service.validate('unknown@example.com', 'pass')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
