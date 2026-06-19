import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthContext } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckoutDto, ConfirmDto } from './billing.dto';
import { BillingService } from './billing.service';
import type { BillingStatus, CheckoutResult } from './billing.types';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('status')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Current plan, limits, and usage.' })
  status(@CurrentUser() ctx: AuthContext): Promise<BillingStatus> {
    return this.billing.status(ctx.accountId);
  }

  @Post('checkout')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'A checkout URL to start the upgrade.' })
  @HttpCode(HttpStatus.OK)
  checkout(@Body() dto: CheckoutDto, @CurrentUser() ctx: AuthContext): Promise<CheckoutResult> {
    return this.billing.checkout(ctx.accountId, dto.plan);
  }

  @Post('portal')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'A customer-portal URL to manage the subscription.' })
  @HttpCode(HttpStatus.OK)
  portal(@CurrentUser() ctx: AuthContext): Promise<CheckoutResult> {
    return this.billing.portal(ctx.accountId);
  }

  @Post('confirm')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Plan synced from the returned Checkout Session.' })
  @HttpCode(HttpStatus.OK)
  confirm(@Body() dto: ConfirmDto, @CurrentUser() ctx: AuthContext): Promise<BillingStatus> {
    return this.billing.confirm(ctx.accountId, dto.sessionId);
  }

  // Public: authenticated by the Stripe signature over the raw body, not a session.
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ): Promise<{ received: true }> {
    await this.billing.handleWebhook(req.rawBody ?? Buffer.alloc(0), signature);
    return { received: true };
  }
}
