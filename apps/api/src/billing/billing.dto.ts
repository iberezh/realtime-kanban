import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { PaidPlan } from './billing.types';

export class CheckoutDto {
  @ApiProperty({ enum: ['pro', 'business'] })
  @IsIn(['pro', 'business'])
  plan!: PaidPlan;
}
