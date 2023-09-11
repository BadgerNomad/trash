import * as redisStore from 'cache-manager-redis-store';

import {
  CacheModule as NestCacheModule,
  DynamicModule,
  Global,
  Inject,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import redis from '@libs/config/redis';

import CacheService from './cache.service';

@Global()
@Module({})
export class CacheModule implements OnModuleDestroy {
  @Inject(ModuleRef) private _moduleRef: ModuleRef;

  static registry(): DynamicModule {
    return {
      imports: [
        NestCacheModule.register({
          store: redisStore,
          ...redis,
        }),
      ],
      global: true,
      module: CacheModule,
      providers: [CacheService],
      exports: [CacheService],
    };
  }

  async onModuleDestroy() {
    const client = this._moduleRef.get(CacheService);
    await client.close();
  }
}
