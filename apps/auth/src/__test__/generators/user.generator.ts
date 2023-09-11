import { Connection } from 'typeorm';

import Utils from '@libs/utils/utils';
import BaseGenerator from '@libs/utils/base.generator';

import AuthTokenService from '@auth/auth/token_service/auth.token.service';
import {
  SessionPayload,
  SessionService,
} from '@auth/caches/sessions/session.service';
import User from '@auth/database/entities/user.entity';

import config from '@auth/config/config';

export interface IUserGeneratorOptions {
  email?: string;
  password?: string;
  email_verified?: boolean;
}

export interface IAuthGeneratorOptions {
  organizationId?: number;
}

export default class UserGenerator extends BaseGenerator<User> {
  private readonly _sessionService: SessionService;
  private readonly _authTokenService: AuthTokenService;

  constructor(
    connection: Connection,
    authTokenService?: AuthTokenService,
    sessionService?: SessionService,
  ) {
    super(connection);

    this._repository = this._database.getRepository(User);

    this._authTokenService = authTokenService;
    this._sessionService = sessionService;
  }

  async user(options: IUserGeneratorOptions) {
    const user = this._repository.create({
      email: options.email ? options.email : `${Utils.getUUID()}@gmail.com`,
      password: options.password ? options.password : 'password',
      email_verified: options.email_verified ? options.email_verified : false,
    });

    await this._repository.save(user);

    return user;
  }

  async auth(user: User) {
    const payload: SessionPayload = {
      userId: user.id,
    };

    const sessionTime = config.auth.jwt.access.lifetime;

    const sessionId = await this._sessionService.set(payload, sessionTime);
    const jwt = this._authTokenService.createTokens(sessionId);

    return { jwt, sessionId };
  }
}
