import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import DatabaseModule from './database/database.module';
import BrokerModule from './broker/broker.module';
import TasksModule from './tasks/tasks.module';
import ListenersModule from './listeners/listeners.module';

@Module({
  imports: [
    DatabaseModule.forRoot({
      cache: false,
    }),
    BrokerModule.forRoot({
      deaf: true,
    }),
    TasksModule,
    EventEmitterModule.forRoot(),
    ListenersModule,
  ],
})
export default class CronModule {}
