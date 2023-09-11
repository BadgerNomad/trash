import {
  ExecutionContext,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { JwtResponse } from '@auth/auth/strategies/jwt.constants';
import AuthTokenService from '@auth/auth/token_service/auth.token.service';
import { SessionService } from '@auth/caches/sessions/session.service';
import User from '@auth/database/entities/user.entity';
import UserOperation, {
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';
import NotificationsUsersOperationsBroadcast from '@auth/processors/notifications/notifications_users_operations/broadcast/notifications_users_operations.broadcast';
import SessionsProcessor from '@auth/processors/sessions/sessions.processor';
import UsersOperationsProcessorPasswordRecovery from '@auth/processors/users_operations/password_recovery/users_operations.processor.password_recovery';
import UsersOperationsProcessorSignUp from '@auth/processors/users_operations/sign_up/users_operations.processor.sign_up';
import UserGenerator from '@auth_test/generators/user.generator';
import MainAbstract from '@auth_test/main.abstract';
import ApplicationTestModule from '@auth_test/main.test-module';
import {
  BadRequestExceptionMessage,
  ForbiddenExceptionMessage,
  IResponseError,
  NotFoundExceptionMessage,
} from '@libs/utils';
import Utils from '@libs/utils/utils';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { Connection } from 'typeorm';

import { expect } from '@jest/globals';

import '@jest-custom/entity-compare.matcher';

import {
  PasswordRecoveryConfirmDto,
  PasswordRecoveryDto,
  SignInDto,
  SignUpDto,
  SignUpResendDto,
  TokenDto,
} from './auth.dto';
import UsersProcessor from '@auth/processors/users/users.processor';

interface ISignUpOptions {
  isUserAlreadyExists?: boolean;
  isPasswordNotValid?: boolean;
}

interface ISignUpConfirmOptions {
  isUserOperationNotFound?: boolean;
}

interface IPasswordRecoveryOptions {
  isPasswordRecoveryNotCreated?: boolean;
}

interface ISignInOptions {
  isUserNotExists?: boolean;
  isPasswordIncorrect?: boolean;
  isEmailNotVerified?: boolean;
}

interface ISignUpResendOptions {
  isOperationNotCreated?: boolean;
}

class AuthModuleTest extends MainAbstract {
  // Services

  private _sessionService: SessionService;
  private _authTokenService: AuthTokenService;
  private _sessionProcessor: SessionsProcessor;
  private _signUpProcessor: UsersOperationsProcessorSignUp;
  private _passwordRecoveryProcessor: UsersOperationsProcessorPasswordRecovery;
  private _notificationProcessor: NotificationsUsersOperationsBroadcast;
  private _processor: UsersProcessor;

  // Generators

  private _userGenerator: UserGenerator;

  run(): void {
    beforeAll(async () => {
      // Create application

      this._app = await ApplicationTestModule();
      this._server = <unknown>this._app.getHttpServer();

      this._database = this._app.get<Connection>(Connection);

      // Services

      this._sessionService = this._app.get<SessionService>(SessionService);
      this._authTokenService =
        this._app.get<AuthTokenService>(AuthTokenService);

      this._sessionProcessor = this._app.get(SessionsProcessor);
      this._signUpProcessor = this._app.get(UsersOperationsProcessorSignUp);
      this._passwordRecoveryProcessor = this._app.get(
        UsersOperationsProcessorPasswordRecovery,
      );

      this._notificationProcessor = this._app.get(
        NotificationsUsersOperationsBroadcast,
      );
      this._sessionProcessor = this._app.get(SessionsProcessor);
      this._processor = this._app.get(UsersProcessor);

      // Create generators

      this._userGenerator = new UserGenerator(
        this._database,
        this._authTokenService,
        this._sessionService,
      );
    });

    afterAll(async () => {
      await this._app.close();
    });

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    describe('Auth module', () => {
      describe('Refresh tokens', () => {
        this.refresh();
      });

      describe('Sign up', () => {
        this.signUp({});
        this.signUp({ isUserAlreadyExists: true });
        this.signUp({ isPasswordNotValid: true });
      });

      describe('Sign up confirm', () => {
        this.signUpConfirm({});
        this.signUpConfirm({ isUserOperationNotFound: true });
      });

      describe('Sign in', () => {
        this.signIn({});
        this.signIn({ isUserNotExists: true });
        this.signIn({ isPasswordIncorrect: true });
        this.signIn({ isEmailNotVerified: true });
      });

      describe('Sign up resend', () => {
        this.signUpResend({});
        this.signUpResend({ isOperationNotCreated: true });
      });

      describe('Password recovery', () => {
        this.passwordRecovery({});
        this.passwordRecovery({ isPasswordRecoveryNotCreated: true });
      });

      describe('Password recovery confirm', () => {
        this.passwordRecoveryConfirm();
      });
    });
  }

  refresh(): void {
    const info = 'Should refresh tokens';

    it(info, async () => {
      const user = await this._userGenerator.user({});

      const { jwt } = await this._userGenerator.auth(user);

      // Mock processor

      const create = jest
        .spyOn(this._sessionProcessor, 'create')
        .mockImplementation(async () => {
          const tokens = {
            accessToken: Utils.getUUID(),
            refreshToken: Utils.getUUID(),
          };

          const response = await Promise.resolve(tokens);

          return response;
        });

      const { status, body } = await this.get<JwtResponse>(
        '/v1/auth/refresh',
        jwt.refreshToken,
      );

      // Checkout response

      expect(status).toBe(200);
      expect(body.ok).toBe(true);

      const result = <JwtResponse>body.result;

      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');

      // Mock processor called

      expect(create).toHaveBeenCalled();
      expect(create).toHaveBeenLastCalledWith({
        userId: user.id,
        organizationId: undefined,
      });
    });
  }

  signUp(options: ISignUpOptions): void {
    let info = 'Simple request';

    if (options.isUserAlreadyExists) {
      info = 'User is already exists';
    } else if (options.isUserAlreadyExists) {
      info = 'Password is not valid';
    }

    it(info, async () => {
      // Mock payload

      const payload: SignUpDto = {
        email: `${Utils.getUUID()}@gmail.com`,
        password: options.isPasswordNotValid
          ? Utils.getUUID()
          : 'sadsdSDwdq2sad!',
      };

      // Mock user

      const user = new User();
      user.id = -1;
      user.email = payload.email;

      // Mock user operations

      const userOperations = new UserOperation();
      userOperations.token = Utils.getUUID();

      // Mock processor

      const authData = jest
        .spyOn(this._processor, 'authData')
        .mockImplementation(async () => {
          await Promise.resolve();

          return options.isUserAlreadyExists ? user : undefined;
        });

      // Mock sign up processor

      const signUp = jest
        .spyOn(this._signUpProcessor, 'create')
        .mockImplementation(async () => {
          await Promise.resolve();

          return userOperations;
        });

      // Mock notification processor

      const onSignUp = jest
        .spyOn(this._notificationProcessor, 'onSignUp')
        .mockImplementation();

      const create = jest
        .spyOn(this._processor, 'create')
        .mockImplementation(async () => {
          return await Promise.resolve(user);
        });

      const { status, body } = await this.post('/v1/auth/sign-up', payload);

      if (options.isPasswordNotValid) {
        const response = <IResponseError>body;
        expect(response.result.message).toBe(
          'password: ' + BadRequestExceptionMessage.PASSWORD_IS_NOT_VALID,
        );

        return;
      }

      // Checkout method auth data called

      expect(authData).toHaveBeenCalled();
      expect(authData).toHaveBeenLastCalledWith(payload);

      // Checkout response

      if (options.isUserAlreadyExists) {
        const response = <IResponseError>body;
        expect(response.result.message).toBe(
          BadRequestExceptionMessage.USER_ALREADY_EXISTS,
        );

        return;
      }

      expect(status).toBe(HttpStatus.CREATED);

      // Checkout method create called

      expect(create).toHaveBeenCalled();
      expect(create).toHaveBeenLastCalledWith(payload, expect.anything());

      // Checkout method create in sign up processor

      expect(signUp).toHaveBeenCalled();
      expect(signUp).toHaveBeenLastCalledWith(
        { user: { email: user.email, id: user.id } },
        expect.anything(),
      );

      // Checkout notification processor called

      expect(onSignUp).toHaveBeenCalled();
      expect(onSignUp).toHaveBeenLastCalledWith({
        email: user.email,
        token: userOperations.token,
      });
    });
  }

  signIn(options: ISignInOptions): void {
    let info = 'Simple request';

    if (options.isUserNotExists) {
      info = 'User is not exist';
    } else if (options.isPasswordIncorrect) {
      info = 'Password is incorrect';
    } else if (options.isEmailNotVerified) {
      info = 'Email not verified';
    }

    it(info, async () => {
      // Mock payload

      const payload: SignInDto = {
        email: `${Utils.getUUID()}@gmail.com`,
        password: Utils.getUUID(),
      };

      // Mock email

      const user = new User();
      user.id = 1;
      user.email = payload.email;
      user.email_verified = !options.isEmailNotVerified;
      user.password = options.isPasswordIncorrect
        ? payload.password
        : this._encryptPassword(payload.password);

      // Mock processor

      const authData = jest
        .spyOn(this._processor, 'authData')
        .mockImplementation(async () => {
          await Promise.resolve();

          return !options.isUserNotExists ? user : undefined;
        });

      // Mock session service

      const createToken = jest
        .spyOn(this._sessionProcessor, 'create')
        .mockImplementation(async () => {
          await Promise.resolve();

          return {
            accessToken: '',
            refreshToken: '',
          };
        });

      // mock recaptcha

      const { status, body } = await this.post<JwtResponse>(
        '/v1/auth/sign-in',
        payload,
      );

      // Checkout response

      const responseError = <IResponseError>body;

      if (options.isPasswordIncorrect || options.isUserNotExists) {
        expect(responseError.result.message).toBe(
          ForbiddenExceptionMessage.WRONG_PASSWORD,
        );

        return;
      }

      if (options.isEmailNotVerified) {
        expect(responseError.result.message).toBe(
          ForbiddenExceptionMessage.NOT_VERIFY,
        );

        return;
      }

      const result = <JwtResponse>body.result;

      expect(status).toBe(HttpStatus.CREATED);

      expect(result.accessToken).not.toBeNull();
      expect(result.refreshToken).not.toBeNull();

      // Checkout processor called

      expect(authData).toHaveBeenCalled();
      expect(authData).toHaveBeenLastCalledWith(payload);

      expect(createToken).toHaveBeenCalled();
      expect(createToken).toHaveBeenLastCalledWith({
        userId: user.id,
      });
    });
  }

  signUpConfirm(options: ISignUpConfirmOptions) {
    let info = 'Simple request';

    if (options.isUserOperationNotFound) {
      info = 'User operation does not exist';
    }

    it(info, async () => {
      // Mock query

      const query: TokenDto = {
        token: Utils.getUUID(),
      };

      const user = await this._userGenerator.user({});

      const userOperation = new UserOperation();
      userOperation.user_id = user.id;
      userOperation.token = query.token;
      userOperation.type = UserOperationType.SIGN_UP_CONFIRM;

      const apply = jest
        .spyOn(this._signUpProcessor, 'apply')
        .mockResolvedValue(
          options.isUserOperationNotFound ? null : userOperation,
        );

      try {
        const { status } = await this.get(
          '/v1/auth/sign-up/confirm/',
          null,
          query,
        );

        expect(apply).toHaveBeenCalled();
        expect(apply).toHaveBeenLastCalledWith({ token: query.token });

        if (!options.isUserOperationNotFound) {
          expect(status).toBe(HttpStatus.OK);
        }
      } catch (err) {
        if (options.isUserOperationNotFound) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe(
            NotFoundExceptionMessage.OPERATION_NOT_FOUND,
          );
        }
      }
    });
  }

  passwordRecovery(options: IPasswordRecoveryOptions) {
    let info = 'Simple request';

    if (options.isPasswordRecoveryNotCreated) {
      info = 'Password recovery is not created';
    }

    it(info, async () => {
      // Mock payload

      const payload: PasswordRecoveryDto = {
        email: `${Utils.getUUID()}@gmail.com`,
      };

      // Mock password recovery

      const userOperation = new UserOperation();
      userOperation.user_id = 1;
      userOperation.token = Utils.getUUID();
      userOperation.type = UserOperationType.PASSWORD_RECOVERY;

      const create = jest
        .spyOn(this._passwordRecoveryProcessor, 'create')
        .mockImplementation(async () => {
          await Promise.resolve();

          return options.isPasswordRecoveryNotCreated ? null : userOperation;
        });

      // Mock notification

      const onPasswordRecovery = jest
        .spyOn(this._notificationProcessor, 'onPasswordRecovery')
        .mockImplementation();

      const { status } = await this.post('/v1/auth/password-recovery', payload);

      // Checkout response

      expect(status).toBe(HttpStatus.CREATED);

      // Checkout processors called

      expect(create).toHaveBeenCalled();
      expect(create).toHaveBeenLastCalledWith({ user: payload.email });

      if (options.isPasswordRecoveryNotCreated) {
        expect(onPasswordRecovery).not.toHaveBeenCalled();

        return;
      }

      expect(onPasswordRecovery).toHaveBeenCalled();
      expect(onPasswordRecovery).toHaveBeenLastCalledWith({
        email: payload.email,
        token: userOperation.token,
      });
    });
  }

  passwordRecoveryConfirm() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock query

      const query: TokenDto = {
        token: Utils.getUUID(),
      };

      const payload: PasswordRecoveryConfirmDto = {
        password: 'sadsdSDwdq2sad!',
      };

      const userOperation = new UserOperation();
      userOperation.user_id = 1;
      userOperation.token = query.token;
      // Mock processor

      const apply = jest
        .spyOn(this._passwordRecoveryProcessor, 'apply')
        .mockImplementation();

      // mock recaptcha

      const { status } = await this.put(
        '/v1/auth/password-recovery/confirm',
        payload,
        null,
        query,
      );

      // Checkout response

      expect(status).toBe(HttpStatus.OK);

      // Checkout processor called

      expect(apply).toHaveBeenCalled();
      expect(apply).toHaveBeenLastCalledWith({
        token: query.token,
        password: payload.password,
      });
    });
  }

  signUpResend(options: ISignUpResendOptions) {
    let info = 'Simple request';

    if (options.isOperationNotCreated) {
      info = 'Operation is not created';
    }

    it(info, async () => {
      // Mock payload

      const payload: SignUpResendDto = {
        email: `${Utils.getUUID()}@gmail.com`,
      };

      // Mock user

      const user = await this._userGenerator.user({});

      // Mock user operations

      const userOperation = new UserOperation();
      userOperation.token = Utils.getUUID();

      const create = jest
        .spyOn(this._signUpProcessor, 'create')
        .mockImplementation(async () => {
          await Promise.resolve();

          return options.isOperationNotCreated ? null : userOperation;
        });

      // Mock notification processor

      const onSignUp = jest
        .spyOn(this._notificationProcessor, 'onSignUp')
        .mockImplementation();

      // mock recaptcha

      const { status } = await this.post('/v1/auth/sign-up/resend', payload);

      // Checkout response

      expect(status).toBe(HttpStatus.CREATED);

      // Checkout processors called

      expect(create).toHaveBeenCalled();
      expect(create).toHaveBeenLastCalledWith({ user: payload.email });

      if (options.isOperationNotCreated) {
        expect(onSignUp).not.toHaveBeenCalled();

        return;
      }

      // checkout notifications
      expect(onSignUp).toHaveBeenCalled();
      expect(onSignUp).toHaveBeenLastCalledWith({
        email: payload.email,
        token: userOperation.token,
      });
    });
  }

  private _encryptPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    return hash;
  }
}

const test = new AuthModuleTest();
test.run();
