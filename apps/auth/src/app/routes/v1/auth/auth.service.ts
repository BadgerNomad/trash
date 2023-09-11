import { Connection } from 'typeorm';

import { Inject, Injectable } from '@nestjs/common';

import {
  BadRequestException,
  BadRequestExceptionMessage,
  ForbiddenException,
  ForbiddenExceptionMessage,
  NotFoundException,
  NotFoundExceptionMessage,
} from '@libs/utils';

import { JwtResponse } from '@auth/auth/strategies/jwt.constants';
import { Session } from '@auth/caches/sessions/session.service';

import UserRepository from '@auth/database/repositories/user.repository';

import UsersProcessor from '@auth/processors/users/users.processor';
import UsersOperationsProcessorSignUp from '@auth/processors/users_operations/sign_up/users_operations.processor.sign_up';
import UsersOperationsProcessorPasswordRecovery from '@auth/processors/users_operations/password_recovery/users_operations.processor.password_recovery';
import NotificationsUsersOperationsBroadcast from '@auth/processors/notifications/notifications_users_operations/broadcast/notifications_users_operations.broadcast';

import {
  PasswordRecoveryConfirmDto,
  PasswordRecoveryDto,
  SignInDto,
  SignUpDto,
  SignUpResendDto,
  TokenDto,
} from './auth.dto';
import SessionsProcessor from '@auth/processors/sessions/sessions.processor';

@Injectable()
export default class AuthService {
  @Inject(Connection)
  private readonly _connection: Connection;

  // Services

  @Inject(SessionsProcessor)
  private readonly _sessionProcessor: SessionsProcessor;
  @Inject(UsersOperationsProcessorSignUp)
  private readonly _signUpProcessor: UsersOperationsProcessorSignUp;
  @Inject(UsersOperationsProcessorPasswordRecovery)
  private readonly _passwordRecoveryProcessor: UsersOperationsProcessorPasswordRecovery;
  @Inject(UsersProcessor)
  private readonly _userProcessor: UsersProcessor;
  @Inject(NotificationsUsersOperationsBroadcast)
  private readonly _notifications: NotificationsUsersOperationsBroadcast;

  async refresh(session: Session): Promise<JwtResponse> {
    const tokens = await this._sessionProcessor.create({
      userId: session.userId,
    });

    return tokens;
  }

  async signUp(payload: SignUpDto) {
    const user = await this._userProcessor.authData(payload);

    if (user) {
      throw new BadRequestException(
        BadRequestExceptionMessage.USER_ALREADY_EXISTS,
      );
    }

    const queryRunner = this._connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const user = await this._userProcessor.create(payload, queryRunner);

      const { token } = await this._signUpProcessor.create(
        { user: user },
        queryRunner,
      );

      await queryRunner.commitTransaction();

      await this._notifications.onSignUp({
        email: user.email.toLowerCase(),
        token: token,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async signUpConfirm(query: TokenDto) {
    const userOperation = await this._signUpProcessor.apply({
      token: query.token,
    });
    if (!userOperation) {
      throw new NotFoundException(NotFoundExceptionMessage.OPERATION_NOT_FOUND);
    }
  }

  async signIn(payload: SignInDto) {
    const user = await this._userProcessor.authData(payload);

    if (!user || !user.passwordCompare(payload.password)) {
      throw new ForbiddenException(ForbiddenExceptionMessage.WRONG_PASSWORD);
    }

    if (!user.email_verified) {
      throw new ForbiddenException(ForbiddenExceptionMessage.NOT_VERIFY);
    }

    const tokens = this._sessionProcessor.create({
      userId: user.id,
    });

    return tokens;
  }

  async passwordRecovery(payload: PasswordRecoveryDto) {
    const passwordRecovery = await this._passwordRecoveryProcessor.create({
      user: payload.email,
    });
    if (!passwordRecovery) {
      return;
    }

    await this._notifications.onPasswordRecovery({
      email: payload.email,
      token: passwordRecovery.token,
    });
  }

  async passwordRecoveryConfirm(
    query: TokenDto,
    payload: PasswordRecoveryConfirmDto,
  ) {
    await this._passwordRecoveryProcessor.apply({
      token: query.token,
      password: payload.password,
    });
  }

  async signUpResend(payload: SignUpResendDto) {
    const signUp = await this._signUpProcessor.create({
      user: payload.email.toLowerCase(),
    });
    if (!signUp) {
      return;
    }
    await this._notifications.onSignUp({
      email: payload.email.toLowerCase(),
      token: signUp.token,
    });
  }
}
