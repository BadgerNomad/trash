import { Module } from '@nestjs/common';

import QueueRestartService from './queue.restart.service';

@Module({
  providers: [QueueRestartService],
})
export default class QueueRestartModule {}
