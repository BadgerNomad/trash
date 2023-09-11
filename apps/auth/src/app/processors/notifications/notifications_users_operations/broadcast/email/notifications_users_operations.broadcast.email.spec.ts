import { Connection } from 'typeorm';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { expect } from '@jest/globals';

import { ISendMessageWithButtonPayload } from '@libs/broker/types/notification/notification.email.constants';
import { BrokerFactoryModule } from '@libs/broker';
import { NotificationTypes } from '@libs/broker/types';
import BrokerClientMock, {
  IBrokerClientMock,
} from '@libs/broker/__test__/BrokerClientMock';

import '@jest-custom/entity-compare.matcher';

import DatabaseModule from '@auth/database/database.module';
import { UserOperationType } from '@auth/database/entities/user_operation.entity';

import config from '@auth/config/config';

import UserOperationGenerator from '@auth_test/generators/user.operation.generator';
import UserGenerator from '@auth_test/generators/user.generator';

import NotificationsUsersOperationsBroadcastModule from '../notifications_users_operations.broadcast.module';
import NotificationsUsersOperationsBroadcastEmail from './notifications_users_operations.broadcast.email';
import { EMAIL_MESSAGE } from './notifications_users_operations.broadcast.email.constants';

jest.mock('@libs/broker/broker.client');
jest.mock('@auth/database/database.module');

class NotificationsUsersOperationsBroadcastEmailTest {
  private _app: INestApplication;

  // Services

  private _processor: NotificationsUsersOperationsBroadcastEmail;

  // Generators

  private _userGenerator: UserGenerator;
  private _userOperationGenerator: UserOperationGenerator;

  // Mocks

  private _broker: IBrokerClientMock;

  run(): void {
    beforeAll(async () => {
      this._broker = BrokerClientMock();

      // Create application

      const testingModule = await Test.createTestingModule({
        imports: [
          DatabaseModule.forRoot(),
          BrokerFactoryModule.forRoot({
            connection: config.rabbit.url,
          }),
          NotificationsUsersOperationsBroadcastModule,
        ],
      }).compile();
      this._app = testingModule.createNestApplication();

      await this._app.init();

      const database = this._app.get(Connection);

      // Services

      this._processor = this._app.get(
        NotificationsUsersOperationsBroadcastEmail,
      );

      // Create generators

      this._userGenerator = new UserGenerator(database);
      this._userOperationGenerator = new UserOperationGenerator(database);
    });

    afterAll(async () => {
      await this._app.close();
    });

    beforeEach(async () => {
      jest.resetAllMocks();
    });

    describe('Notifications processor. Email', () => {
      describe('On sign up', () => {
        this.onSignUp();
      });

      describe('On password recovery', () => {
        this.onPasswordRecovery();
      });

      describe('On password change', () => {
        this.onPasswordChange();
      });

      describe('On email change', () => {
        this.onEmailChange();
      });
    });
  }

  onSignUp() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      // Mock operations

      const userOperation = await this._userOperationGenerator.userOperation({
        user_id: user.id,
        type: UserOperationType.SIGN_UP,
      });

      await this._processor.onSignUp({
        email: user.email,
        token: userOperation.token,
      });

      // Checkout notification

      expect(this._broker.send).toHaveBeenCalledTimes(1);

      const queue = this._broker.send.mock.calls[0][0];
      expect(queue).toBe(NotificationTypes.Email.NOTIFICATION_EMAIL);

      const message: NotificationTypes.Email.ISendMessage =
        this._broker.send.mock.calls[0][1];

      const baseUrl = `https://${config.notifications.base_url}`;
      const button =
        baseUrl + `/auth?mode=sign-in&confirmCode=${userOperation.token}`;

      expect(message.to).toBe(user.email);
      expect(message.subject).toBe(EMAIL_MESSAGE.SIGN_UP_CONFIRM.SUBJECT);

      const payload = <ISendMessageWithButtonPayload>message.payload;

      expect(payload.url).toBe(button);
      expect(payload.body).toBe(EMAIL_MESSAGE.SIGN_UP_CONFIRM.BODY);
      expect(payload.button).toBe(EMAIL_MESSAGE.SIGN_UP_CONFIRM.BUTTON);
    });
  }

  onPasswordRecovery() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      // Mock operations

      const userOperation = await this._userOperationGenerator.userOperation({
        user_id: user.id,
        type: UserOperationType.PASSWORD_RECOVERY,
      });

      await this._processor.onPasswordRecovery({
        email: user.email,
        token: userOperation.token,
      });

      // Checkout notification

      expect(this._broker.send).toHaveBeenCalledTimes(1);

      const queue = this._broker.send.mock.calls[0][0];
      expect(queue).toBe(NotificationTypes.Email.NOTIFICATION_EMAIL);

      const message: NotificationTypes.Email.ISendMessage =
        this._broker.send.mock.calls[0][1];

      const baseUrl = `https://${config.notifications.base_url}`;
      const url =
        baseUrl +
        `/auth/recovery-password?passwordRecoveryCode=${userOperation.token}`;

      expect(message.to).toBe(user.email);
      expect(message.subject).toBe(EMAIL_MESSAGE.PASSWORD_RECOVERY.SUBJECT);

      const payload = <ISendMessageWithButtonPayload>message.payload;

      expect(payload.url).toBe(url);
      expect(payload.button).toBe(EMAIL_MESSAGE.PASSWORD_RECOVERY.BUTTON);
      expect(payload.body).toBe(EMAIL_MESSAGE.PASSWORD_RECOVERY.BODY);
    });
  }

  onPasswordChange() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      // Mock operations

      const userOperation = await this._userOperationGenerator.userOperation({
        user_id: user.id,
        type: UserOperationType.PASSWORD_CHANGE,
      });

      await this._processor.onPasswordChange({
        email: user.email,
        token: userOperation.token,
      });

      // Checkout notification

      expect(this._broker.send).toHaveBeenCalledTimes(1);

      const queue = this._broker.send.mock.calls[0][0];
      expect(queue).toBe(NotificationTypes.Email.NOTIFICATION_EMAIL);

      const message: NotificationTypes.Email.ISendMessage =
        this._broker.send.mock.calls[0][1];

      const baseUrl = `https://${config.notifications.base_url}`;
      const url =
        baseUrl +
        `/auth?mode=change-password&recoveryCode=${userOperation.token}`;

      expect(message.to).toBe(user.email);
      expect(message.subject).toBe(EMAIL_MESSAGE.PASSWORD_CHANGE.SUBJECT);

      const payload = <ISendMessageWithButtonPayload>message.payload;

      expect(payload.url).toBe(url);
      expect(payload.button).toBe(EMAIL_MESSAGE.PASSWORD_CHANGE.BUTTON);
      expect(payload.body).toBe(EMAIL_MESSAGE.PASSWORD_CHANGE.BODY);
    });
  }

  onEmailChange() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock user

      const user = await this._userGenerator.user({});

      // Mock operations

      const userOperation = await this._userOperationGenerator.userOperation({
        user_id: user.id,
        type: UserOperationType.EMAIL_CHANGE,
      });

      await this._processor.onEmailChange({
        email: user.email,
        token: userOperation.token,
      });

      // Checkout notification

      expect(this._broker.send).toHaveBeenCalledTimes(1);

      const queue = this._broker.send.mock.calls[0][0];
      expect(queue).toBe(NotificationTypes.Email.NOTIFICATION_EMAIL);

      const message: NotificationTypes.Email.ISendMessage =
        this._broker.send.mock.calls[0][1];

      const baseUrl = `https://${config.notifications.base_url}`;
      const url =
        baseUrl +
        `/profile?mode=email-change&emailChangeCode=${userOperation.token}`;

      expect(message.to).toBe(user.email);
      expect(message.subject).toBe(EMAIL_MESSAGE.EMAIL_CHANGE.SUBJECT);

      const payload = <ISendMessageWithButtonPayload>message.payload;

      expect(payload.url).toBe(url);
      expect(payload.button).toBe(EMAIL_MESSAGE.EMAIL_CHANGE.BUTTON);
      expect(payload.body).toBe(EMAIL_MESSAGE.EMAIL_CHANGE.BODY);
    });
  }
}

const test = new NotificationsUsersOperationsBroadcastEmailTest();
test.run();
