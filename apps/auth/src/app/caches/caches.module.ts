import { Global, Module } from '@nestjs/common';

import { SessionModule } from './sessions/session.module';

@Global()
@Module({
  imports: [SessionModule],
  exports: [SessionModule],
})
export default class CachesModule {}
