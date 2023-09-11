import { Request } from 'express';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

import { APP_GUARD } from '@nestjs/core';
import { ExecutionContext, Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { ThrottlerBehindProxyGuard } from '@auth/auth/guards/throttler.proxy.guard';

import config from '@auth/config/config';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot({
      storage: new ThrottlerStorageRedisService(config.redis.url),
      limit: config.rate_limit.default.limit,
      ttl: config.rate_limit.default.rate,
      skipIf: (context: ExecutionContext) => {
        if (context.getType() !== 'http') {
          return true;
        }

        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request>();

        return request.method === 'GET';
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export default class RateLimitModule {}
