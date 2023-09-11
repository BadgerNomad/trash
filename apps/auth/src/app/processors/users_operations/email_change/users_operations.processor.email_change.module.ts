import { Global, Module } from '@nestjs/common';

import SessionsProcessorModule from '@auth/processors/sessions/sessions.processor.module';
import UsersProcessorNativeModule from '@auth/processors/users/users.processor.module';

import UsersOperationsProcessorEmailChange from './users_operations.processor.email_change';

@Global()
@Module({
  imports: [UsersProcessorNativeModule, SessionsProcessorModule],
  providers: [UsersOperationsProcessorEmailChange],
  exports: [UsersOperationsProcessorEmailChange],
})
export default class UsersOperationsProcessorEmailChangeModule {}
