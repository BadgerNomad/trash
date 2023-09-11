import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import RequestContextMiddleware from '@libs/utils/request.context.middleware';

import DatabaseModule from './database/database.module';
import BrokerModule from './broker/broker.module';
import RoutesModule from './routes/routes.module';
import QueuesModule from './queues/queues.module';
import ListenersModule from './listeners/listeners.module';
import CachesModule from './caches/caches.module';

@Module({
  imports: [
    DatabaseModule.forRoot(),
    BrokerModule.forRoot(),
    RoutesModule,
    QueuesModule,
    EventEmitterModule.forRoot(),
    ListenersModule,
    CachesModule,
  ],
})
export default class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
