import { Inject } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import CacheService from '@libs/cache/cache.service';

export class RedisHealthIndicator extends HealthIndicator {
  @Inject(CacheService)
  private readonly _redisService: CacheService;

  constructor() {
    super();
  }

  pingCheck(key: string) {
    const isReady = this._redisService.isReady();

    if (!isReady) {
      throw new HealthCheckError(`redis failed`, this.getStatus(key, isReady));
    }

    return this.getStatus(key, isReady);
  }
}
