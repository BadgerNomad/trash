import { Global, Module } from '@nestjs/common';

import NotificationBrokerProducerModule from './notification_producer/notification.module';

@Global()
@Module({
  imports: [NotificationBrokerProducerModule],
})
export default class BrokerProducersModule {}
