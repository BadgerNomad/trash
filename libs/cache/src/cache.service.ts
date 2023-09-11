/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache, Store } from 'cache-manager';
import { RedisClientType } from 'redis';

interface RedisCache extends Cache {
  store: RedisStore;
}

interface RedisStore extends Store {
  name: 'redis';
  getClient: () => RedisClientType;
  isCacheableValue: (value: any) => boolean;
}

@Injectable()
export default class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: RedisCache) {}

  public async set(key: string, value: any, ttl?: number | 'NX'): Promise<any> {
    value = JSON.stringify(value);

    let baseCommand = `SET ${key} "${value}"`;

    if (!ttl) {
      await this.cache.set(key, value);
    } else if (typeof ttl === 'number') {
      baseCommand += ` EX ${ttl}`;
      await this.cache.set(key, value, { ttl });
    } else {
      baseCommand = `SETNX ${key} "${value}"`;
      await this.cache.del(key);

      const client = this.cache.store.getClient();

      await client.SETNX(key, JSON.stringify(value));
    }
  }

  public async get<T>(key: string): Promise<T> {
    const data: string = await this.cache.get(key);

    let response: T = null;

    if (data) {
      response = <T>JSON.parse(data);
    }

    return response;
  }

  public async del(key: string): Promise<any> {
    await this.cache.del(key);
  }

  public async flushAll(): Promise<any> {
    await this.cache.reset();
  }

  async close() {
    const client = this.cache.store.getClient();

    client.on('error', (err) => console.log('Redis client err', err));
    await client.quit();
  }

  public isReady() {
    const client = this.cache.store.getClient();

    const isReady = <boolean>client['connected'];

    return isReady;
  }
}
