import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import type { PaidPlan } from './billing.types';

export class CheckoutDto {
  @ApiProperty({ enum: ['pro', 'business'] })
  @IsIn(['pro', 'business'])
  plan!: PaidPlan;
}

export class ConfirmDto {
  @ApiProperty({ description: 'The Checkout Session id returned to the success URL.' })
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
