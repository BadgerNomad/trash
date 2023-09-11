import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import config from '@auth/config/config';
import { JwtPayload } from '@auth/caches/sessions/session.service';

import { JwtResponse } from '../strategies/jwt.constants';

@Injectable()
export default class AuthTokenService extends JwtService {
  public createTokens(sessionId: string): JwtResponse {
    const payload: JwtPayload = {
      id: sessionId,
    };

    const accessToken = super.sign(payload, {
      secret: config.auth.jwt.access.secret,
      expiresIn: config.auth.jwt.access.lifetime,
    });

    const refreshToken = super.sign(payload, {
      secret: config.auth.jwt.refresh.secret,
      expiresIn: config.auth.jwt.refresh.lifetime,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
