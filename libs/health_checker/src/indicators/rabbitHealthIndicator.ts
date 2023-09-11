import { Inject } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { BrokerClient } from '@libs/broker';

export class RabbitHealthIndicator extends HealthIndicator {
  @Inject(BrokerClient)
  private readonly _client: BrokerClient;

  constructor() {
    super();
  }

  pingCheck(key: string) {
    const isReady = this._client.isConnection();

    if (!isReady) {
      throw new HealthCheckError(`rabbit failed`, this.getStatus(key, isReady));
    }

    return this.getStatus(key, isReady);
  }
}
