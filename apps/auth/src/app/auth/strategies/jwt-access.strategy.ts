import { ExtractJwt, Strategy } from 'passport-jwt';

import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  UnauthorizedException,
  UnauthorizedExceptionMessage,
} from '@libs/utils';

import {
  JwtPayload,
  SessionService,
} from '@auth/caches/sessions/session.service';
import UserRepository from '@auth/database/repositories/user.repository';

import config from '@auth/config/config';

@Injectable()
export default class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  private readonly _service: SessionService;
  private readonly _userRepository: UserRepository;

  constructor(
    session: SessionService,
    @Inject(UserRepository) userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.auth.jwt.access.secret,
    });

    this._service = session;

    this._userRepository = userRepository;
  }

  async validate(payload: JwtPayload) {
    if (!payload?.id) {
      return null;
    }

    const session = await this._service.get(payload.id);

    if (!session) {
      throw new UnauthorizedException(
        UnauthorizedExceptionMessage.INVALID_SESSION,
      );
    }

    const user = await this._userRepository.findOne(session.userId);

    if (!user) {
      await this._service.delete(payload.id);

      throw new UnauthorizedException(
        UnauthorizedExceptionMessage.INVALID_SESSION,
      );
    }

    return session;
  }
}
