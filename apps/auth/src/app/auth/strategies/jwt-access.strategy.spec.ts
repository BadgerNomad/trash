import { Connection } from 'typeorm';

import { expect } from '@jest/globals';

import {
  UnauthorizedException,
  UnauthorizedExceptionMessage,
} from '@libs/utils';
import Utils from '@libs/utils/utils';

import { Session } from '@libs/types/base.dto';

import '@jest-custom/entity-compare.matcher';

import UserRepository from '@auth/database/repositories/user.repository';

import {
  JwtPayload,
  SessionService,
} from '@auth/caches/sessions/session.service';

import UserGenerator from '@auth_test/generators/user.generator';

import MainAbstract from '@auth_test/main.abstract';
import ApplicationTestModule from '@auth_test/main.test-module';

import JwtAccessStrategy from './jwt-access.strategy';

interface IValidateOptions {
  isUserNotExist?: boolean;
  isSessionNotExist?: boolean;
  isPayloadNotProvided?: boolean;
}

class JwtAccessStrategyTest extends MainAbstract {
  // Services

  private _strategy: JwtAccessStrategy;
  private _sessionService: SessionService;
  private _userRepository: UserRepository;

  // Generators

  private _userGenerator: UserGenerator;

  run(): void {
    beforeAll(async () => {
      this._app = await ApplicationTestModule();
      this._server = this._app.getHttpServer();
      this._database = this._app.get(Connection);

      // Services

      this._sessionService = this._app.get(SessionService);
      this._userRepository = this._app.get(UserRepository);

      // Create Generators

      this._userGenerator = new UserGenerator(this._database);

      this._strategy = new JwtAccessStrategy(
        this._sessionService,
        this._userRepository,
      );
    });

    afterAll(async () => {
      await this._app.close();
    });

    beforeEach(async () => {
      jest.restoreAllMocks();
    });

    describe('JwtAccessStrategy', () => {
      describe('Validate', () => {
        this.validate({});
        this.validate({ isUserNotExist: true });
        this.validate({ isPayloadNotProvided: true });
        this.validate({ isSessionNotExist: true });
      });
    });
  }

  validate(options: IValidateOptions) {
    let info = 'Successful request';

    if (options.isUserNotExist) {
      info = 'User does not exist';
    } else if (options.isPayloadNotProvided) {
      info = 'Payload is not provided';
    }

    it(info, async () => {
      const payload: JwtPayload = options.isPayloadNotProvided
        ? null
        : { id: Utils.getUUID() };

      const session: Session = {
        id: Utils.getUUID(),
        userId: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Generate user

      const user = options.isUserNotExist
        ? null
        : await this._userGenerator.user({});

      // Setup mock implementations for this test

      const get = jest
        .spyOn(this._sessionService, 'get')
        .mockImplementation(() => {
          return Promise.resolve(session);
        });

      const deleteSession = jest
        .spyOn(this._sessionService, 'delete')
        .mockImplementation();

      const findOne = jest
        .spyOn(this._userRepository, 'findOne')
        .mockImplementation(() => {
          return Promise.resolve(user);
        });

      try {
        const result = await this._strategy.validate(payload);

        if (options.isUserNotExist) {
          new Error('Base case');
        }

        if (options.isPayloadNotProvided) {
          expect(get).not.toHaveBeenCalled();
          expect(result).toBeFalsy();

          return;
        }

        expect(get).toHaveBeenCalled();
        expect(get).toHaveBeenLastCalledWith(payload.id);

        expect(findOne).toHaveBeenCalled();
        expect(findOne).toHaveBeenLastCalledWith(session.userId);

        expect(result).toEqual(session);
      } catch (error) {
        if (options.isUserNotExist || options.isSessionNotExist) {
          expect(deleteSession).toHaveBeenCalled();
          expect(deleteSession).toHaveBeenLastCalledWith(payload.id);

          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            UnauthorizedExceptionMessage.INVALID_SESSION,
          );

          return;
        }

        throw error;
      }
    });
  }
}

const test = new JwtAccessStrategyTest();
test.run();
