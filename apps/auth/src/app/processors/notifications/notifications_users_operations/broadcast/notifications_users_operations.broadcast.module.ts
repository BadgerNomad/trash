import { FactoryProvider, Global, Module } from '@nestjs/common';
import NotificationBrokerProducerModule from '@auth/broker/producers/notification_producer/notification.module';

import NotificationsUsersOperationsBroadcastEmail from './email/notifications_users_operations.broadcast.email';
import NotificationsUsersOperationsBroadcast from './notifications_users_operations.broadcast';
import { INotificationsUsersOperationsProcessor } from './notifications_users_operations.broadcast.abstract';

const service: FactoryProvider = {
  provide: NotificationsUsersOperationsBroadcast,
  useFactory: (...services: INotificationsUsersOperationsProcessor[]) => {
    return new NotificationsUsersOperationsBroadcast(...services);
  },
  inject: [NotificationsUsersOperationsBroadcastEmail],
};

@Global()
@Module({
  imports: [NotificationBrokerProducerModule],
  providers: [NotificationsUsersOperationsBroadcastEmail, service],
  exports: [service],
})
export default class NotificationsUsersOperationsBroadcastModule {}
