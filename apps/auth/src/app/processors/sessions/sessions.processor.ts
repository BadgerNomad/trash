import { Inject } from '@nestjs/common';

import AuthTokenService from '@auth/auth/token_service/auth.token.service';
import {
  SessionPayload,
  SessionService,
} from '@auth/caches/sessions/session.service';

import User from '@auth/database/entities/user.entity';
import config from '@auth/config/config';

export interface IUserCreateResponse {
  user: User;
}

export default class SessionsProcessor {
  private readonly _sessionTime = config.auth.jwt.refresh.lifetime;

  @Inject(AuthTokenService)
  private readonly _authTokenService: AuthTokenService;
  @Inject(SessionService)
  private readonly _sessionService: SessionService;

  async create(session: SessionPayload) {
    const sessionId = await this._sessionService.set(
      session,
      this._sessionTime,
    );

    const tokens = this._authTokenService.createTokens(sessionId);

    return tokens;
  }

  async dropAll(user_id: number) {
    await this._sessionService.delete(user_id);
  }
}
