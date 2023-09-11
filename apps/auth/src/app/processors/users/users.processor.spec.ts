import { config } from 'dotenv';
config();

import { Connection } from 'typeorm';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { expect } from '@jest/globals';
import '@jest-custom/entity-compare.matcher';

import Utils from '@libs/utils/utils';

import DatabaseModule from '@auth/database/database.module';

import UserGenerator from '@auth_test/generators/user.generator';

import UsersProcessor, {
  IEmailAuthCreateData,
  IUserUpdate,
} from './users.processor';
import UsersProcessorModule from './users.processor.module';

jest.mock('@auth/database/database.module');

interface IAuthDataOptions {
  isEmailNotExist?: boolean;
}

class UsersProcessorTest {
  private _app: INestApplication;

  // Services

  private _processor: UsersProcessor;

  // Generators

  private _userGenerator: UserGenerator;

  run(): void {
    beforeAll(async () => {
      // Create application

      const testingModule = await Test.createTestingModule({
        imports: [DatabaseModule.forRoot(), UsersProcessorModule],
      }).compile();
      this._app = testingModule.createNestApplication();

      await this._app.init();

      const database = this._app.get(Connection);

      // Services

      this._processor = this._app.get(UsersProcessor);

      // Create generators

      this._userGenerator = new UserGenerator(database);
    });

    afterAll(async () => {
      await this._app.close();
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    describe('Users processor. Base', () => {
      describe('Auth data', () => {
        this.authData({});
        this.authData({ isEmailNotExist: true });
      });

      describe('Create', () => {
        this.create();
      });

      describe('Update', () => {
        this.update();
      });
    });
  }

  authData(options: IAuthDataOptions) {
    let info = 'Simple request';

    if (options.isEmailNotExist) {
      info = 'Email not exist';
    }

    it(info, async () => {
      // Mock user and email

      const user = await this._userGenerator.user({});

      const response = await this._processor.authData({
        email: options.isEmailNotExist
          ? `${Utils.getUUID()}@gmail.com`
          : user.email,
      });

      if (options.isEmailNotExist) {
        expect(response).toBe(undefined);
        return;
      }

      expect(response).toEntityCompare(user);
    });
  }

  create() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock payload

      const payload: IEmailAuthCreateData = {
        email: `${Utils.getUUID()}@gmail.com`,
        password: Utils.getUUID(),
      };

      const user = await this._processor.create(payload, null);

      // Checkout processors

      const userEmail = await this._userGenerator.repository.findOne({
        where: {
          email: payload.email,
        },
        select: ['id', 'email', 'email_verified', 'password'],
      });

      expect(user).toEntityCompare(userEmail);
    });
  }

  update() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock user
      const user = await this._userGenerator.user({});

      // Mock payload

      const payload: IUserUpdate = {
        email_verified: true,
        password: Utils.getUUID(),
      };

      await this._processor.update(user.id, payload, null);

      // Checkout processor

      const userUpdated = await this._userGenerator.repository.findOne({
        where: { id: user.id },
        select: ['password', 'email_verified', 'id'],
      });

      expect(userUpdated.email_verified).toBe(payload.email_verified);
      expect(userUpdated.passwordCompare(payload.password)).toBeTruthy();
    });
  }
}

const test = new UsersProcessorTest();
test.run();
