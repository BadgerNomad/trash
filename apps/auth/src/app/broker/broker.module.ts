import { DynamicModule, Global, Module } from '@nestjs/common';

import { BrokerFactoryModule } from '@libs/broker';
import { BrokerModuleDeafOptions } from '@libs/broker/broker.client';

import config from '@auth/config/config';

import BrokerListenersModule from './listeners/broker_listeners.module';
import BrokerProducersModule from './producers/broker_producers.module';

@Global()
@Module({})
export default class BrokerModule {
  static forRoot(options: BrokerModuleDeafOptions = {}): DynamicModule {
    const listeners = options.deaf ? [] : [BrokerListenersModule];

    return {
      imports: [
        BrokerFactoryModule.forRoot({
          connection: config.rabbit.url,
          deaf: options.deaf,
        }),
        BrokerProducersModule,
        ...listeners,
      ],
      module: BrokerModule,
      global: true,
    };
  }
}
