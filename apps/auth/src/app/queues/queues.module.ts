import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';

import config from '@auth/config/config';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: config.redis,
    }),
  ],
})
export default class QueuesModule {}
