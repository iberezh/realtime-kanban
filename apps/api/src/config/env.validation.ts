import { plainToInstance } from 'class-transformer';
import { IsInt, IsString, Max, Min, MinLength, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @IsString()
  CORS_ORIGIN: string = 'http://localhost:3000';

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;
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
