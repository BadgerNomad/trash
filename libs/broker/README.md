# Broker library

Realize broker module with RabbitMQ client and decorators.
Introduce interfaces of brokers messages.

## Example usage

### Broker module:

Main file for broker module on application. Source:

```
import { DynamicModule, Global, Module } from '@nestjs/common';

import { BrokerFactoryModule } from '@libs/broker';

import SimpleBrokerModule from './simple/simple.module';

export interface IBrokerModuleConfig {
  connection: string;
  deaf?: boolean;
}

@Global()
@Module({})
export default class BrokerModule {
  static forRoot(options: IBrokerModuleConfig = {}): DynamicModule {
    return {
      imports: [
        BrokerFactoryModule.forRoot({
          connection: options.connection,
          deaf: options.deaf,
        }),
        SimpleBrokerModule,
      ],
      module: BrokerModule,
      global: true,
    };
  }
}
```

### Simple module

Module with logic for simple module messages. (Controllers, services and producers). Source:

```
import { Global, Module } from '@nestjs/common';

import SimpleBrokerController from './simple.controller';
import SimpleBrokerService from './simple.service';
import SimpleBrokerProducer from './simple.producer';

@Global()
@Module({
  controllers: [SimpleBrokerController],
  providers: [SimpleBrokerService, SimpleBrokerProducer],
  exports: [SimpleBrokerProducer],
})
export default class SimpleBrokerModule {}

```

Producer. Manager for sending messages. Source:
```
import { Injectable } from '@nestjs/common';

import { BrokerClient } from '@libs/broker';

@Injectable()
export default class SimpleBrokerProducer {
  private readonly _client: BrokerClient;

  constructor(client: BrokerClient) {
    this._client = client;
  }

  async onMessage(data: any) {
    await this._client.send('any_topic', data);
  }
}
```

Controller. Manager accepting messages. Must use "Subscribe" decorator for receiving method with subscription topic. Source:
```
import { Controller, Inject } from '@nestjs/common';

import { Subscribe } from '@libs/broker';

import SimpleBrokerService from './simple.service';

@Controller()
export default class SimpleBrokerController {
  @Inject()
  private readonly _service: SimpleBrokerService;

  @Subscribe('any_topic')
  async onMessage(data: any) {
    await this._service.onMessage(data);
  }
}
```

Service. Service with business logic for controller.
```
import { Inject, Injectable } from '@nestjs/common';

import PaymentsService from '@auth/payments/payments.service';
import { TransactionStatus } from '@auth/database/entities/transaction.entity';

@Injectable()
export default class SimpleBrokerService {
  @Inject(PaymentsService)
  private readonly _payment: PaymentsService;

  async onMessage(data: any): Promise<void> {
    ... any logic
  }
}
```

### Options

* connection - RabbitMQ Url.
* deaf - Disable subscribe method. [Default: false]