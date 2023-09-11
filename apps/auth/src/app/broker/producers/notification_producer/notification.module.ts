import { Global, Module } from '@nestjs/common';

import NotificationBrokerProducerService from './notification_producer.service';

@Global()
@Module({
  providers: [NotificationBrokerProducerService],
  exports: [NotificationBrokerProducerService],
})
export default class NotificationBrokerProducerModule {}
