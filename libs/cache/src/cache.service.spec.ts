import { config } from 'dotenv';
config();

import { CACHE_MANAGER } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import Utils from '@libs/utils/utils';

import CacheService from './cache.service';
import { CacheModule } from './cache.module';

interface IGetOptions {
  isKeyNotExists?: boolean;
}

type IDelOptions = IGetOptions;

class CacheServiceTest {
  private _module: TestingModule;
  private _cacheService: CacheService;

  run(): void {
    beforeAll(async () => {
      this._module = await Test.createTestingModule({
        imports: [CacheModule.registry()],
      }).compile();

      const cache = this._module.get(CACHE_MANAGER);

      // Service

      this._cacheService = new CacheService(cache);
    });

    afterAll(async () => {
      await this._module.close();
    });

    describe('Cache service ', () => {
      describe('Set', () => {
        this.set();
      });

      describe('Get', () => {
        this.get({});
        this.get({ isKeyNotExists: true });
      });

      describe('Del', () => {
        this.del({});
        this.del({ isKeyNotExists: true });
      });

      describe('Flush all', () => {
        this.flushAll();
      });

      describe('Close', () => {
        this.close();
      });
    });
  }

  set() {
    const info = 'Simple request';

    it(info, async () => {
      const { key, value } = await this._set();

      const cache = await this._cacheService.get(key);

      // Checkout

      expect(cache).toBe(value);
    });
  }

  get(options: IGetOptions) {
    let info = 'Simple request';

    if (options.isKeyNotExists) {
      info = 'Key not exists';
    }

    it(info, async () => {
      const { key, value } = await this._set();

      const cache = await this._cacheService.get(
        options.isKeyNotExists ? Utils.getUUID() : key,
      );

      // Checkout response

      if (options.isKeyNotExists) {
        expect(cache).toBeNull();
        return;
      }

      expect(cache).toBe(value);
    });
  }

  del(options: IDelOptions) {
    let info = 'Simple request';

    if (options.isKeyNotExists) {
      info = 'Key not exists';
    }

    it(info, async () => {
      let { key } = await this._set();

      key = options.isKeyNotExists ? Utils.getUUID() : key;

      await this._cacheService.del(key);

      const cache = await this._cacheService.get(key);

      // Checkout
      expect(cache).toBeNull();
    });
  }

  flushAll() {
    const info = 'Simple request';

    it(info, async () => {
      const keys: string[] = [];

      for (let i = 0; i < 3; i++) {
        const { key } = await this._set();

        keys.push(key);
      }

      await this._cacheService.flushAll();

      // Checkout

      for (const key of keys) {
        const cache = await this._cacheService.get(key);
        expect(cache).toBeNull();
      }
    });
  }

  close() {
    const info = 'Simple request';

    it(info, async () => {
      const client = this._cacheService['cache'].store.getClient();
      expect(client['connected']).toBeTruthy();

      await this._cacheService.close();
      expect(client['closing']).toBeTruthy();
    });
  }

  private async _set() {
    const key = Utils.getUUID();
    const value = Utils.getUUID();

    await this._cacheService.set(key, value);

    return {
      key,
      value,
    };
  }
}

const test = new CacheServiceTest();
test.run();
