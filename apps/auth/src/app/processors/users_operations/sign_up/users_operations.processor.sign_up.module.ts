import { Global, Module } from '@nestjs/common';
import UsersProcessorNativeModule from '@auth/processors/users/users.processor.module';

import UsersOperationsProcessorSignUp from './users_operations.processor.sign_up';

@Global()
@Module({
  imports: [UsersProcessorNativeModule],
  providers: [UsersOperationsProcessorSignUp],
  exports: [UsersOperationsProcessorSignUp],
})
export default class UsersOperationsProcessorSignUpModule {}
