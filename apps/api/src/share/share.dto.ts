import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, registerDecorator, type ValidationOptions } from 'class-validator';

/** Passes when the value is an ISO date string strictly in the future. */
function IsFutureDate(options?: ValidationOptions) {
  return (target: object, propertyName: string): void => {
    registerDecorator({
      name: 'isFutureDate',
      target: target.constructor,
      propertyName,
      ...(options ? { options } : {}),
      validator: {
        validate: (value: unknown): boolean =>
          typeof value === 'string' && new Date(value).getTime() > Date.now(),
        defaultMessage: () => 'expiresAt must be a date in the future',
      },
    });
  };
}

export class CreateShareLinkDto {
  @ApiPropertyOptional({
    description:
      'Expiry instant (ISO 8601), must be in the future. Omit for a link that never expires.',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  @IsFutureDate()
  expiresAt?: string | null;
}
