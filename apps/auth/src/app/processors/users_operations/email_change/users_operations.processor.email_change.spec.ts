import { Connection } from 'typeorm';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { expect } from '@jest/globals';

import Utils from '@libs/utils/utils';
import { BadRequestExceptionMessage } from '@libs/utils';

import '@jest-custom/entity-compare.matcher';

import DatabaseModule from '@auth/database/database.module';
import UserOperation, {
  IEmailChangeData,
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';

import UserOperationGenerator from '@auth_test/generators/user.operation.generator';
import UserGenerator from '@auth_test/generators/user.generator';

import SessionsProcessor from '@auth/processors/sessions/sessions.processor';
import UsersProcessor from '@auth/processors/users/users.processor';

import UsersOperationsProcessorAbstract from '../users_operations.abstract.processor';

import UsersOperationsProcessorEmailChange, {
  ICreateEmailChangePayload,
} from './users_operations.processor.email_change';
import UsersOperationsProcessorEmailChangeModule from './users_operations.processor.email_change.module';

jest.mock('@auth/database/database.module');

interface ICreateOptions {
  isEmailAlreadyExists?: boolean;
}

interface IApplyOptions {
  isEmailAlreadyExists?: boolean;
}

class UsersOperationsProcessorEmailChangeTest {
  private _app: INestApplication;

  // Services

  private _processor: UsersOperationsProcessorEmailChange;
  private _usersProcessor: UsersProcessor;
  private _sessionProcessor: SessionsProcessor;

  // Generators

  private _userGenerator: UserGenerator;
  private _userOperationGenerator: UserOperationGenerator;

  run(): void {
    beforeAll(async () => {
      // Create application

      const testingModule = await Test.createTestingModule({
        imports: [
          DatabaseModule.forRoot(),
          UsersOperationsProcessorEmailChangeModule,
        ],
      }).compile();

      this._app = testingModule.createNestApplication();
      const database = this._app.get(Connection);

      // Services

      this._processor = this._app.get(UsersOperationsProcessorEmailChange);
      this._usersProcessor = this._app.get(UsersProcessor);
      this._sessionProcessor = this._app.get(SessionsProcessor);

      // Create generators

      this._userGenerator = new UserGenerator(database);
      this._userOperationGenerator = new UserOperationGenerator(database);
      this._userGenerator = new UserGenerator(database);
    });

    afterAll(async () => {
      await this._app.close();
    });

    beforeEach(async () => {
      jest.restoreAllMocks();
    });

    describe('Users operations processor. Email change', () => {
      describe('Create', () => {
        this.create({});
        this.create({ isEmailAlreadyExists: true });
      });

      describe('Apply', () => {
        this.apply({});
        this.apply({ isEmailAlreadyExists: true });
      });
    });
  }

  create(options: ICreateOptions) {
    let info = 'Simple request';

    if (options.isEmailAlreadyExists) {
      info = 'Email is already exists';
    }

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      const otherUser = await this._userGenerator.user({});

      // Mock payload

      const payload: ICreateEmailChangePayload = {
        user: user.id,
        data: {
          email: options.isEmailAlreadyExists
            ? otherUser.email
            : `${Utils.getUUID()}@gmail.com`,
        },
      };

      // Mock super

      const userOperation = new UserOperation();
      userOperation.type = UserOperationType.EMAIL_CHANGE;
      userOperation.data = payload.data;

      const createSuper = jest
        .spyOn(UsersOperationsProcessorAbstract.prototype, 'create')
        .mockImplementation(async () => {
          return userOperation;
        });

      try {
        const response = await this._processor.create(payload, null);

        if (options.isEmailAlreadyExists) {
          throw new Error('Bad case');
        }

        // Checkout response

        expect(response.type).toBe(UserOperationType.EMAIL_CHANGE);
        expect(response.data['email']).toBe(payload.data['email']);

        // Checkout super called

        expect(createSuper).toBeCalled();
        expect(createSuper).lastCalledWith(payload, null);
      } catch (error) {
        if (options.isEmailAlreadyExists) {
          expect(error.toString()).toBe(
            `BadRequestException: ${BadRequestExceptionMessage.USER_ALREADY_EXISTS}`,
          );

          return;
        }
        throw error;
      }
    });
  }

  apply(options: IApplyOptions) {
    let info = 'Simple request';

    if (options.isEmailAlreadyExists) {
      info = 'Email is already exists';
    }

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      const otherUser = await this._userGenerator.user({});

      const token = Utils.getUUID();

      // Mock user organization

      const data = <IEmailChangeData>{
        email: options.isEmailAlreadyExists
          ? otherUser.email
          : `${Utils.getUUID()}@gmail.com`,
      };

      const userOperation = new UserOperation();
      userOperation.user_id = user.id;
      userOperation.type = UserOperationType.EMAIL_CHANGE;
      userOperation.data = data;

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

      // Mock session processor

      const dropAll = jest
        .spyOn(this._sessionProcessor, 'dropAll')
        .mockImplementation();

      try {
        await this._processor.apply({ token });

        expect(superApply).toBeCalled();
        expect(superApply).lastCalledWith({ token }, expect.anything());

        if (options.isEmailAlreadyExists) {
          throw new Error('Bad case');
        }

        expect(update).toBeCalled();
        expect(update).lastCalledWith(
          user.id,
          { email: data.email },
          expect.anything(),
        );

        // Checkout session processor called

        expect(dropAll).toBeCalled();
        expect(dropAll).lastCalledWith(userOperation.user_id);
      } catch (error) {
        if (options.isEmailAlreadyExists) {
          expect(error.toString()).toBe(
            `BadRequestException: ${BadRequestExceptionMessage.USER_ALREADY_EXISTS}`,
          );

          expect(update).not.toBeCalled();
          return;
        }
        throw error;
      }
    });
  }
}

const test = new UsersOperationsProcessorEmailChangeTest();
test.run();
