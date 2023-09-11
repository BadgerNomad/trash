import { Injectable } from '@nestjs/common';
import { NotificationTypes } from '@libs/broker/types';

import UserRepository from '@auth/database/repositories/user.repository';

import NotificationBrokerProducerService from '@auth/broker/producers/notification_producer/notification_producer.service';

@Injectable()
export default class NotificationsBroadcastEmail {
  private readonly _broker: NotificationBrokerProducerService;
  private readonly _repository: UserRepository;

  constructor(
    broker: NotificationBrokerProducerService,
    repository: UserRepository,
  ) {
    this._broker = broker;
    this._repository = repository;
  }

  protected async _contactData(userId: number) {
    if (!userId) {
      return;
    }

    const userInfo = await this._repository.getOne({
      filter: {
        id: userId,
      },
      cache: true,
    });

    return userInfo;
  }

  protected async _contactDataEmail(email: string) {
    const userInfo = await this._repository.getOne({
      filter: {
        email,
      },
      cache: true,
    });

    return userInfo;
  }

  async broadcast(data: NotificationTypes.Email.ISendMessage): Promise<void> {
    await this._broker.onSendMessageInEmail(data);
  }
}
