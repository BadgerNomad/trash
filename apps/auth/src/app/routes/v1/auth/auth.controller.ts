import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { RequestAuth } from '@libs/types/base.dto';

import { JwtRefreshGuard } from '@auth/auth/guards/jwt-refresh.guard';
import { JwtResponse } from '@auth/auth/strategies/jwt.constants';

import config from '@auth/config/config';

import {
  PasswordRecoveryConfirmDto,
  PasswordRecoveryDto,
  SignInDto,
  SignUpDto,
  SignUpResendDto,
  TokenDto,
} from './auth.dto';
import AuthService from './auth.service';

@ApiTags('v1', 'auth')
@Controller('/v1/auth')
export default class AuthController {
  @Inject()
  private readonly _service: AuthService;

  @Get('refresh')
  @ApiOperation({
    description: 'JWT token refresh',
  })
  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  async refresh(@Request() req: RequestAuth): Promise<JwtResponse> {
    const session = req.user;

    const data = await this._service.refresh(session);

    return data;
  }

  @Post('sign-up')
  @ApiOperation({
    description: 'Sign up',
  })
  async signUp(@Body() payload: SignUpDto) {
    await this._service.signUp(payload);
  }

  @Get('sign-up/confirm')
  @ApiOperation({
    description: 'Sign up confirm',
  })
  async signUpConfirm(@Query() query: TokenDto) {
    const response = await this._service.signUpConfirm(query);

    return response;
  }

  @Post('sign-in')
  @ApiOperation({
    description: 'Sign in',
  })
  async signIn(@Body() payload: SignInDto) {
    const response = await this._service.signIn(payload);

    return response;
  }

  @Post('sign-up/resend')
  @ApiOperation({
    description: 'Resend sign up',
  })
  @Throttle(
    config.rate_limit.resend.default.limit,
    config.rate_limit.resend.default.rate,
  )
  async signUpResend(@Body() payload: SignUpResendDto) {
    await this._service.signUpResend(payload);
  }

  @Post('password-recovery')
  @ApiOperation({
    description: 'Password recovery',
  })
  @Throttle(
    config.rate_limit.resend.default.limit,
    config.rate_limit.resend.default.rate,
  )
  async passwordRecovery(@Body() payload: PasswordRecoveryDto) {
    await this._service.passwordRecovery(payload);
  }

  @Put('password-recovery/confirm')
  @ApiOperation({
    description: 'Password recovery confirm',
  })
  async passwordRecoveryConfirm(
    @Query() query: TokenDto,
    @Body() payload: PasswordRecoveryConfirmDto,
  ) {
    await this._service.passwordRecoveryConfirm(query, payload);
  }
}
