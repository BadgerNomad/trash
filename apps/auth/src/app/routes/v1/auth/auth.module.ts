import { Module } from '@nestjs/common';

import JwtRefreshStrategy from '@auth/auth/strategies/jwt-refresh.strategy';

import UsersProcessorModule from '@auth/processors/users/users.processor.module';
import SessionsProcessorModule from '@auth/processors/sessions/sessions.processor.module';

import UsersOperationsProcessorPasswordRecoveryModule from '@auth/processors/users_operations/password_recovery/users_operations.processor.password_recovery.module';
import UsersOperationsProcessorSignUpModule from '@auth/processors/users_operations/sign_up/users_operations.processor.sign_up.module';
import NotificationsUsersOperationsBroadcastModule from '@auth/processors/notifications/notifications_users_operations/broadcast/notifications_users_operations.broadcast.module';

import AuthController from './auth.controller';
import AuthService from './auth.service';

@Module({
  imports: [
    SessionsProcessorModule,
    UsersProcessorModule,
    UsersOperationsProcessorSignUpModule,
    UsersOperationsProcessorPasswordRecoveryModule,
    NotificationsUsersOperationsBroadcastModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshStrategy],
})
export default class AuthModule {}
