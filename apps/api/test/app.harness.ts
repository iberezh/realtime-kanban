import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AccountsRepository } from '../src/billing/accounts.repository';
import { BILLING_PROVIDER } from '../src/billing/billing.types';
import { MockBillingProvider } from '../src/billing/mock-billing.provider';

/** Boots the app exactly like main.ts (prefix, cookie parsing, validation) for e2e tests. */
export async function createTestApp(): Promise<INestApplication> {
  // E2E always runs the keyless mock provider, regardless of any real Stripe key in .env.
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(BILLING_PROVIDER)
    .useFactory({
      inject: [AccountsRepository, ConfigService],
      factory: (accounts: AccountsRepository, config: ConfigService) =>
        new MockBillingProvider(accounts, config),
    })
    .compile();
  const app = moduleRef.createNestApplication({ rawBody: true });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  return app;
}

let workspaceCount = 0;

/** Signs up a fresh workspace and returns an agent that carries its session cookie. */
export async function authedAgent(
  app: INestApplication,
): Promise<ReturnType<typeof request.agent>> {
  const agent = request.agent(app.getHttpServer());
  workspaceCount += 1;
  await agent
    .post('/api/v1/auth/signup')
    .send({
      email: `e2e-${Date.now()}-${workspaceCount}@example.com`,
      password: 'password123',
      name: 'E2E User',
      accountName: 'E2E Workspace',
    })
    .expect(201);
  return agent;
}
