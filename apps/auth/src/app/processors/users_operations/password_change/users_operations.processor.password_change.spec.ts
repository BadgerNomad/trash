import { Connection } from 'typeorm';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { expect } from '@jest/globals';

import Utils from '@libs/utils/utils';

import '@jest-custom/entity-compare.matcher';

import DatabaseModule from '@auth/database/database.module';
import UserOperation, {
  IPasswordChangeData,
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';

import SessionsProcessor from '@auth/processors/sessions/sessions.processor';
import UsersProcessor from '@auth/processors/users/users.processor';

import UserGenerator from '@auth_test/generators/user.generator';

import UsersOperationsProcessorAbstract from '../users_operations.abstract.processor';

import UsersOperationsProcessorPasswordChange, {
  ICreatePasswordChangePayload,
} from './users_operations.processor.password_change';

import UsersOperationsProcessorPasswordChangeModule from './users_operations.processor.password_change.module';

jest.mock('@auth/database/database.module');

interface ICreateOptions {
  isUserNotFound?: boolean;
}

class UsersOperationsProcessorPasswordChangeTest {
  private _app: INestApplication;

  // Services

  private _processor: UsersOperationsProcessorPasswordChange;
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
          UsersOperationsProcessorPasswordChangeModule,
        ],
      }).compile();

      this._app = testingModule.createNestApplication();

      await this._app.init();

      const database = this._app.get(Connection);

      // Services

      this._processor = this._app.get(UsersOperationsProcessorPasswordChange);
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

    describe('Users operations processor. Password change', () => {
      describe('Apply', () => {
        this.apply();
      });

      describe('Create', () => {
        this.create({});
        this.create({ isUserNotFound: true });
      });
    });
  }

  apply() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      const token = Utils.getUUID();

      // Mock user organization

      const data = <IPasswordChangeData>{ password: Utils.getUUID() };
      const userOperation = new UserOperation();
      userOperation.user_id = user.id;
      userOperation.type = UserOperationType.PASSWORD_CHANGE;
      userOperation.data = data;

      // Mock session processor

      const dropAll = jest
        .spyOn(this._sessionProcessor, 'dropAll')
        .mockImplementation();

      // Mock super apply

      const superApply = jest
        .spyOn(UsersOperationsProcessorAbstract.prototype, 'apply')
        .mockImplementation(async () => {
          return userOperation;
        });

      // Mock user processor

      const update = jest
        .spyOn(this._usersProcessor, 'update')
        .mockImplementation();

      await this._processor.apply({ token });

      expect(superApply).toBeCalled();
      expect(superApply).lastCalledWith({ token }, expect.anything());

      expect(update).toBeCalled();
      expect(update).lastCalledWith(
        user.id,
        { password: data.password },
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
      info = 'User is not found';
    }

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      // Mock payload

      const payload: ICreatePasswordChangePayload = {
        user: options.isUserNotFound
          ? `${Utils.getUUID()}@gmail.com`
          : user.email,

        data: {
          password: Utils.getUUID(),
        },
      };

      // Mock super create processor

      const superCreate = jest
        .spyOn(UsersOperationsProcessorAbstract.prototype, 'create')
        .mockImplementation();

      await this._processor.create(payload, null);

      if (options.isUserNotFound) {
        expect(superCreate).not.toBeCalled();
        return;
      }

      expect(superCreate).toBeCalled();
      expect(superCreate).lastCalledWith(
        { user: user.id, data: payload.data },
        null,
      );
    });
  }
}

const test = new UsersOperationsProcessorPasswordChangeTest();
test.run();
