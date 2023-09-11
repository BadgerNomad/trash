import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@libs/cache/cache.module';

import { SessionService } from './session.service';

@Global()
@Module({
  imports: [CacheModule.registry()],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
