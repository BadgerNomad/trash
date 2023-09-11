import { Inject, Injectable } from '@nestjs/common';

import {
  EmailTemplates,
  ISendMessage,
  ISendMessageWithButtonPayload,
} from '@libs/broker/types/notification/notification.email.constants';

import NotificationBrokerProducerService from '@auth/broker/producers/notification_producer/notification_producer.service';

import UserRepository from '@auth/database/repositories/user.repository';
import NotificationsBroadcastEmail from '@auth/processors/notifications/broadcast/notifications.broadcast.email';

import config from '@auth/config/config';

import {
  INotificationPasswordChangePayload,
  INotificationPasswordRecoveryPayload,
  INotificationSignUpPayload,
  INotificationsUsersOperationsProcessor,
} from '../notifications_users_operations.broadcast.abstract';
import { EMAIL_MESSAGE } from './notifications_users_operations.broadcast.email.constants';

@Injectable()
export default class NotificationsUsersOperationsBroadcastEmail
  extends NotificationsBroadcastEmail
  implements INotificationsUsersOperationsProcessor
{
  constructor(
    @Inject(NotificationBrokerProducerService)
    broker: NotificationBrokerProducerService,
    @Inject(UserRepository) repository: UserRepository,
  ) {
    super(broker, repository);
  }

  async onPasswordChange(payload: INotificationPasswordChangePayload) {
    const site = `https://${config.notifications.base_url}`;

    const url =
      site + `/auth?mode=change-password&recoveryCode=${payload.token}`;

    const messagePayload: ISendMessageWithButtonPayload = {
      body: EMAIL_MESSAGE.PASSWORD_CHANGE.BODY,
      url,
      button: EMAIL_MESSAGE.PASSWORD_CHANGE.BUTTON,
    };

    const sendPayload: ISendMessage = {
      to: payload.email,
      subject: EMAIL_MESSAGE.PASSWORD_CHANGE.SUBJECT,
      payload: messagePayload,
      template: EmailTemplates.WITH_BUTTON,
    };

    await this.broadcast(sendPayload);
  }

  async onEmailChange(payload: INotificationSignUpPayload) {
    const site = `https://${config.notifications.base_url}`;

    const url =
      site + `/profile?mode=email-change&emailChangeCode=${payload.token}`;

    const messagePayload: ISendMessageWithButtonPayload = {
      body: EMAIL_MESSAGE.EMAIL_CHANGE.BODY,
      url,
      button: EMAIL_MESSAGE.EMAIL_CHANGE.BUTTON,
    };

    const sendPayload: ISendMessage = {
      to: payload.email,
      subject: EMAIL_MESSAGE.EMAIL_CHANGE.SUBJECT,
      payload: messagePayload,
      template: EmailTemplates.WITH_BUTTON,
    };

    await this.broadcast(sendPayload);
  }

  async onPasswordRecovery(payload: INotificationPasswordRecoveryPayload) {
    const site = `https://${config.notifications.base_url}`;

    const url =
      site + `/auth/recovery-password?passwordRecoveryCode=${payload.token}`;

    const messagePayload: ISendMessageWithButtonPayload = {
      body: EMAIL_MESSAGE.PASSWORD_RECOVERY.BODY,
      url,
      button: EMAIL_MESSAGE.PASSWORD_RECOVERY.BUTTON,
    };

    const sendPayload: ISendMessage = {
      to: payload.email,
      subject: EMAIL_MESSAGE.PASSWORD_RECOVERY.SUBJECT,
      payload: messagePayload,
      template: EmailTemplates.WITH_BUTTON,
    };

    await this.broadcast(sendPayload);
  }

  async onSignUp(payload: INotificationSignUpPayload) {
    const site = `https://${config.notifications.base_url}`;

    const url = site + `/auth?mode=sign-in&confirmCode=${payload.token}`;

    const messagePayload: ISendMessageWithButtonPayload = {
      body: EMAIL_MESSAGE.SIGN_UP_CONFIRM.BODY,
      url,
      button: EMAIL_MESSAGE.SIGN_UP_CONFIRM.BUTTON,
    };

    const sendPayload: ISendMessage = {
      to: payload.email,
      subject: EMAIL_MESSAGE.SIGN_UP_CONFIRM.SUBJECT,
      payload: messagePayload,
      template: EmailTemplates.WITH_BUTTON,
    };

    await this.broadcast(sendPayload);
  }
}
