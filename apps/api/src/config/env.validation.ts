import { plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @IsString()
  CORS_ORIGIN: string = 'http://localhost:3002';

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;

  /** Signs and verifies JWTs. Must be at least 16 characters. */
  @IsString()
  @MinLength(16)
  JWT_SECRET!: string;

  /** Public app origin used for billing return URLs. Falls back to CORS_ORIGIN. */
  @IsString()
  @IsOptional()
  APP_URL?: string;

  /** Optional. When set, the Socket.IO Redis adapter fans out across instances. */
  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  /** Stripe billing — all optional; when STRIPE_SECRET_KEY is absent the mock provider runs. */
  @IsString()
  @IsOptional()
  STRIPE_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  STRIPE_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  STRIPE_PRICE_PRO?: string;

  @IsString()
  @IsOptional()
  STRIPE_PRICE_BUSINESS?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors = validateSync(env, { whitelist: true });
  if (errors.length > 0) {
    const details = errors.map((error) => error.property).join(', ');
    throw new Error(`Invalid environment variables: ${details}`);
  }
  return env;
}
