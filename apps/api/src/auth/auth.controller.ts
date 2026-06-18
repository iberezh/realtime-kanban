import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AUTH_COOKIE, COOKIE_MAX_AGE_SECONDS } from './auth.constants';
import { AuthService } from './auth.service';
import type { AuthContext, PublicProfile } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

function cookieOptions(secure: boolean): Record<string, unknown> {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS * 1000,
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @ApiCreatedResponse({ description: 'User and workspace created.' })
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicProfile> {
    const profile = await this.auth.signup(dto);
    const ctx: AuthContext = {
      userId: profile.user.id,
      accountId: profile.account.id,
      role: 'owner',
    };
    const token = this.auth.issueToken(ctx);
    const secure = process.env.NODE_ENV === 'production';
    res.cookie(AUTH_COOKIE, token, cookieOptions(secure));
    return profile;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Credentials valid; session cookie set.' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicProfile> {
    const ctx = await this.auth.validate(dto.email, dto.password);
    const token = this.auth.issueToken(ctx);
    const secure = process.env.NODE_ENV === 'production';
    res.cookie(AUTH_COOKIE, token, cookieOptions(secure));
    return this.auth.profileFor(ctx.userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Session cookie cleared.' })
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(AUTH_COOKIE, { path: '/' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ description: 'The authenticated user profile.' })
  @ApiUnauthorizedResponse({ description: 'No valid session.' })
  me(@CurrentUser() ctx: AuthContext): Promise<PublicProfile> {
    return this.auth.profileFor(ctx.userId);
  }
}
