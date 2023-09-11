import { Global, Module } from '@nestjs/common';
import SessionsProcessorModule from '@auth/processors/sessions/sessions.processor.module';
import UsersProcessorNativeModule from '@auth/processors/users/users.processor.module';

import UsersOperationsProcessorPasswordChange from './users_operations.processor.password_change';

@Global()
@Module({
  imports: [UsersProcessorNativeModule, SessionsProcessorModule],
  providers: [UsersOperationsProcessorPasswordChange],
  exports: [UsersOperationsProcessorPasswordChange],
})
export default class UsersOperationsProcessorPasswordChangeModule {}
