import { Global, Module } from '@nestjs/common';

import AuthTokenModule from '@auth/auth/token_service/auth.token.module';
import { SessionModule } from '@auth/caches/sessions/session.module';

import SessionsProcessor from './sessions.processor';

@Global()
@Module({
  imports: [SessionModule, AuthTokenModule],
  providers: [SessionsProcessor],
  exports: [SessionsProcessor],
})
export default class SessionsProcessorModule {}
