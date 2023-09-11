import { Global, Module } from '@nestjs/common';
import SessionsProcessorModule from '@auth/processors/sessions/sessions.processor.module';
import UsersProcessorNativeModule from '@auth/processors/users/users.processor.module';

import UsersOperationsProcessorPasswordRecovery from './users_operations.processor.password_recovery';

@Global()
@Module({
  imports: [UsersProcessorNativeModule, SessionsProcessorModule],
  providers: [UsersOperationsProcessorPasswordRecovery],
  exports: [UsersOperationsProcessorPasswordRecovery],
})
export default class UsersOperationsProcessorPasswordRecoveryModule {}
