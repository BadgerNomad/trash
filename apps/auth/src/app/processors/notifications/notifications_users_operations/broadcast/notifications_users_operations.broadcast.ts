import { Injectable } from '@nestjs/common';

import {
  INotificationEmailChangePayload,
  INotificationPasswordChangePayload,
  INotificationPasswordRecoveryPayload,
  INotificationSignUpPayload,
  INotificationsUsersOperationsProcessor,
} from './notifications_users_operations.broadcast.abstract';

@Injectable()
export default class NotificationsUsersOperationsBroadcast
  implements INotificationsUsersOperationsProcessor
{
  private readonly _services: INotificationsUsersOperationsProcessor[];

  constructor(...services: INotificationsUsersOperationsProcessor[]) {
    this._services = services;
  }

  async onSignUp(payload: INotificationSignUpPayload): Promise<void> {
    for (const service of this._services) {
      try {
        await service.onSignUp(payload);
      } catch (err) {
        continue;
      }
    }
  }

  async onPasswordRecovery(
    payload: INotificationPasswordRecoveryPayload,
  ): Promise<void> {
    for (const service of this._services) {
      try {
        await service.onPasswordRecovery(payload);
      } catch (err) {
        continue;
      }
    }
  }

  async onPasswordChange(
    payload: INotificationPasswordChangePayload,
  ): Promise<void> {
    for (const service of this._services) {
      try {
        await service.onPasswordChange(payload);
      } catch (err) {
        continue;
      }
    }
  }

  async onEmailChange(payload: INotificationEmailChangePayload): Promise<void> {
    for (const service of this._services) {
      try {
        await service.onEmailChange(payload);
      } catch (err) {
        continue;
      }
    }
  }
}
