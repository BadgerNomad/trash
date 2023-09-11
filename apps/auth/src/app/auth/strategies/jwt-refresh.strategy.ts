import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  JwtPayload,
  SessionService,
} from '@auth/caches/sessions/session.service';

import config from '@auth/config/config';

@Injectable()
export default class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly _service: SessionService;

  constructor(session: SessionService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.auth.jwt.refresh.secret,
      // secretOrKey: 'YvcMg2GW6gZjAwdramXafS9lHaQ9txbvSHZNHDDR',
      algorithms: ['RS256'],
    });

    this._service = session;
  }

  async validate(payload: JwtPayload) {
    if (!payload.id) {
      return null;
    }

    const session = await this._service.get(payload.id);

    return session;
  }
}
