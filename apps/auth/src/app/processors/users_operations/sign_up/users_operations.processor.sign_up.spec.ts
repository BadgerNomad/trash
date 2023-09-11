import { config } from 'dotenv';
config();

import { Connection } from 'typeorm';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { expect } from '@jest/globals';

import Utils from '@libs/utils/utils';

import '@jest-custom/entity-compare.matcher';

import DatabaseModule from '@auth/database/database.module';

import { UserOperationType } from '@auth/database/entities/user_operation.entity';

import UsersProcessor from '@auth/processors/users/users.processor';

import UserGenerator from '@auth_test/generators/user.generator';
import UserOperationGenerator from '@auth_test/generators/user.operation.generator';

import UsersOperationsProcessorSignUp from './users_operations.processor.sign_up';
import UsersOperationsProcessorSignUpModule from './users_operations.processor.sign_up.module';

jest.mock('@auth/database/database.module');

interface IApplyOptions {
  isTokenInvalid?: boolean;
  isTtlExpired?: boolean;
  isTokenNotFromThisOperations?: boolean;
}

interface ICreateOptions {
  isEmailVerified?: boolean;
  isUserNotFound?: boolean;
}

class UsersOperationsProcessorSignUpTest {
  private _app: INestApplication;

  // Services

  private _processor: UsersOperationsProcessorSignUp;
  private _usersProcessor: UsersProcessor;

  // Generators

  private _userOperationGenerator: UserOperationGenerator;
  private _userGenerator: UserGenerator;

  run(): void {
    beforeAll(async () => {
      // Create application

      const testingModule = await Test.createTestingModule({
        imports: [
          DatabaseModule.forRoot(),
          UsersOperationsProcessorSignUpModule,
        ],
      }).compile();
      this._app = testingModule.createNestApplication();

      await this._app.init();

      const database = this._app.get(Connection);

      // Services

      this._processor = this._app.get(UsersOperationsProcessorSignUp);
      this._usersProcessor = this._app.get(UsersProcessor);

      // Create generators

      this._userOperationGenerator = new UserOperationGenerator(database);
      this._userGenerator = new UserGenerator(database);
    });

    afterAll(async () => {
      await this._app.close();
    });

    beforeEach(async () => {
      jest.restoreAllMocks();
    });

    describe('Users operations processor. Sign up', () => {
      describe('Create', () => {
        this.create({});
        this.create({ isEmailVerified: true });
        this.create({ isUserNotFound: true });
      });

      describe('Apply', () => {
        this.apply({});
        this.apply({ isTokenInvalid: true });
        this.apply({ isTtlExpired: true });
        this.apply({ isTokenNotFromThisOperations: true });
      });
    });
  }

  create(options: ICreateOptions) {
    let info = 'Simple request';

    if (options.isEmailVerified) {
      info = 'Email is verified';
    } else if (options.isUserNotFound) {
      info = 'User not found';
    }

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({
        email_verified: !!options.isEmailVerified,
      });

      // Mock private method

      const close = jest
        .spyOn(this._processor, <any>'_close')
        .mockImplementation();

      const userOperations = await this._processor.create({
        user: options.isUserNotFound
          ? `${Utils.getUUID()}@gmail.com`
          : user.email,
      });

      if (options.isEmailVerified || options.isUserNotFound) {
        expect(userOperations).toBeFalsy();
        expect(close).not.toBeCalled();
        return;
      }

      // Checkout close called

      expect(close).toBeCalled();

      const argsClose = close.mock.calls[0][0];
      const transactionClose = close.mock.calls[0][1];

      expect(argsClose).toBe(user.id);
      expect(transactionClose.constructor.name === 'PostgresQueryRunner');

      // Checkout response

      const userOperationCreated =
        await this._userOperationGenerator.repository.findOne({
          where: { id: userOperations.id, type: UserOperationType.SIGN_UP },
        });

      expect(userOperationCreated).toBeDefined();
    });
  }

  apply(options: IApplyOptions) {
    let info = 'Simple request';

    if (options.isTokenInvalid) {
      info = 'Token is invalid';
    } else if (options.isTtlExpired) {
      info = 'Operations expired';
    } else if (options.isTokenNotFromThisOperations) {
      info = 'Token is not from this operation';
    }
    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      const token = Utils.getUUID();

      // Mock user organization

      await this._userOperationGenerator.userOperation({
        user_id: user.id,
        type: options.isTokenNotFromThisOperations
          ? UserOperationType.PASSWORD_RECOVERY
          : UserOperationType.SIGN_UP,
        ttl: options.isTtlExpired ? new Date() : null,
        token: options.isTokenInvalid ? Utils.getUUID() : token,
      });

      // Mock private method

      const close = jest
        .spyOn(this._processor, <any>'_close')
        .mockImplementation();

      // Mock user processor

      const update = jest
        .spyOn(this._usersProcessor, 'update')
        .mockImplementation();

      const response = await this._processor.apply({ token: token });

      // Checkout response

      if (
        options.isTokenInvalid ||
        options.isTtlExpired ||
        options.isTokenNotFromThisOperations
      ) {
        expect(response).toBeFalsy();

        expect(close).not.toBeCalled();
        expect(update).not.toBeCalled();
        return;
      }

      const userOperationRemoved =
        await this._userOperationGenerator.repository.findOne({
          where: {
            token,
            type: UserOperationType.SIGN_UP,
          },
        });

      expect(response).toEqual(userOperationRemoved);

      // Checkout close called

      expect(close).toBeCalled();

      const argsClose = close.mock.calls[0][0];
      const transactionClose = close.mock.calls[0][1];

      expect(argsClose).toBe(user.id);
      expect(transactionClose.constructor.name === 'PostgresQueryRunner');

      expect(update).toBeCalled();

      const argsFirstUpdate = update.mock.calls[0][0];
      const argsSecondUpdate = update.mock.calls[0][1];
      const transactionUpdate = update.mock.calls[0][2];

      expect(argsFirstUpdate).toBe(user.id);
      expect(argsSecondUpdate).toEqual({ email_verified: true });
      expect(transactionUpdate.constructor.name === 'PostgresQueryRunner');
    });
  }
}

const test = new UsersOperationsProcessorSignUpTest();
test.run();
