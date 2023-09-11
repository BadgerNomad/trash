import { Connection } from 'typeorm';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { expect } from '@jest/globals';

import Utils from '@libs/utils/utils';

import '@jest-custom/entity-compare.matcher';

import UserOperation, {
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';

import DatabaseModule from '@auth/database/database.module';

import SessionsProcessor from '@auth/processors/sessions/sessions.processor';
import UsersProcessor from '@auth/processors/users/users.processor';

import UserGenerator from '@auth_test/generators/user.generator';

import UsersOperationsProcessorAbstract from '../users_operations.abstract.processor';

import UsersOperationsProcessorPasswordRecovery, {
  IApplyPasswordRecovery,
} from './users_operations.processor.password_recovery';

import UsersOperationsProcessorPasswordRecoveryModule from './users_operations.processor.password_recovery.module';

jest.mock('@auth/database/database.module');

interface ICreateOptions {
  isUserNotFound?: boolean;
  isEmailNotVerified?: boolean;
}

class UsersOperationsProcessorPasswordRecoveryTest {
  private _app: INestApplication;

  // Services

  private _processor: UsersOperationsProcessorPasswordRecovery;
  private _usersProcessor: UsersProcessor;
  private _sessionProcessor: SessionsProcessor;

  // Generators

  private _userGenerator: UserGenerator;

  run(): void {
    beforeAll(async () => {
      // Create application

      const testingModule = await Test.createTestingModule({
        imports: [
          DatabaseModule.forRoot(),
          UsersOperationsProcessorPasswordRecoveryModule,
        ],
      }).compile();

      this._app = testingModule.createNestApplication();

      await this._app.init();

      const database = this._app.get(Connection);

      // Services

      this._processor = this._app.get(UsersOperationsProcessorPasswordRecovery);
      this._usersProcessor = this._app.get(UsersProcessor);
      this._sessionProcessor = this._app.get(SessionsProcessor);

      // Create generators

      this._userGenerator = new UserGenerator(database);
    });

    afterAll(async () => {
      await this._app.close();
    });

    beforeEach(async () => {
      jest.restoreAllMocks();
    });

    describe('Users operations processor. Password recovery', () => {
      describe('Apply', () => {
        this.apply();
      });

      describe('Create', () => {
        this.create({});
        this.create({ isUserNotFound: true });
        this.create({ isEmailNotVerified: true });
      });
    });
  }

  apply() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      const token = Utils.getUUID();

      // Mock payload

      const payload: IApplyPasswordRecovery = {
        token: token,
        password: Utils.getUUID(),
      };

      // Mock user processor

      const update = jest
        .spyOn(this._usersProcessor, 'update')
        .mockImplementation();

      // Mock session processor

      const dropAll = jest
        .spyOn(this._sessionProcessor, 'dropAll')
        .mockImplementation();

      // Mock super apply processor

      const userOperation = new UserOperation();
      userOperation.type = UserOperationType.PASSWORD_RECOVERY;
      userOperation.user_id = user.id;

      const superApply = jest
        .spyOn(UsersOperationsProcessorAbstract.prototype, 'apply')
        .mockImplementation(async () => {
          return userOperation;
        });

      await this._processor.apply(payload);

      // Checkout super apply called

      expect(superApply).toBeCalled();
      expect(superApply).lastCalledWith(payload, expect.anything());

      expect(update).toBeCalled();
      expect(update).lastCalledWith(
        user.id,
        { password: payload.password },
        expect.anything(),
      );

      // Checkout session processor called

      expect(dropAll).toBeCalled();
      expect(dropAll).lastCalledWith(userOperation.user_id);
    });
  }

  create(options: ICreateOptions) {
    let info = 'Simple request';

    if (options.isUserNotFound) {
      info = 'User not found';
    } else if (options.isEmailNotVerified) {
      info = 'Email not verified';
    }

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({
        email_verified: !options.isEmailNotVerified,
      });

      // Mock payload

      const payload = options.isUserNotFound
        ? `${Utils.getUUID()}@gmail.com`
        : user.email;

      // Mock super create processor

      const superCreate = jest
        .spyOn(UsersOperationsProcessorAbstract.prototype, 'create')
        .mockImplementation();

      await this._processor.create({ user: payload }, null);

      if (options.isEmailNotVerified || options.isUserNotFound) {
        expect(superCreate).not.toBeCalled();
        return;
      }

      expect(superCreate).toBeCalled();
      expect(superCreate).lastCalledWith({ data: null, user: user.id }, null);
    });
  }
}

const test = new UsersOperationsProcessorPasswordRecoveryTest();
test.run();
