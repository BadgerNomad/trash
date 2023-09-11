import { Global, Module } from '@nestjs/common';

import UsersProcessor from './users.processor';

@Global()
@Module({
  providers: [UsersProcessor],
  exports: [UsersProcessor],
})
export default class UsersProcessorModule {}
