import { Injectable } from '@nestjs/common';

import { BrokerClient } from '@libs/broker';

import { NotificationTypes } from '@libs/broker/types';

@Injectable()
export default class NotificationBrokerProducerService {
  private readonly _client: BrokerClient;

  constructor(client: BrokerClient) {
    this._client = client;
  }

  async onSendMessageInEmail(data: NotificationTypes.Email.ISendMessage) {
    await this._client.send(NotificationTypes.Email.NOTIFICATION_EMAIL, data);
  }
}
