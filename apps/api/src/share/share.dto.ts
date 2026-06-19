import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class CreateShareLinkDto {
  @ApiPropertyOptional({
    description: 'Expiry instant (ISO 8601). Omit for a link that never expires.',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  expiresAt?: string | null;
}
