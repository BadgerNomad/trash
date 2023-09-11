import { config } from 'dotenv';
config();

import { Test, TestingModule } from '@nestjs/testing';

import Utils from '@libs/utils/utils';

import LocalStorageService from './local_storage.service';
import { LocalStorageModule } from './local_storage.module';

interface IGetOptions {
  isKeyNotExists?: boolean;
}

class LocalStorageServiceTest {
  private _module: TestingModule;
  private _service: LocalStorageService;

  run(): void {
    beforeAll(async () => {
      this._module = await Test.createTestingModule({
        imports: [LocalStorageModule],
      }).compile();

      // Service

      this._service = new LocalStorageService({ path: 'local_storage' });

      await this._service.init();
    });

    afterAll(async () => {
      await this._service.clear();
      await this._module.close();
    });

    beforeEach(async () => {
      await this._service.clear();
    });

    describe('Local storage service ', () => {
      describe('Set', () => {
        this.set();
      });

      describe('Get', () => {
        this.get({});
        this.get({ isKeyNotExists: true });
      });

      describe('Get keys', () => {
        this.getKeys();
      });

      describe('Remove', () => {
        this.remove();
      });

      describe('Clear', () => {
        this.remove();
      });
    });
  }

  set() {
    const info = 'Simple request';

    it(info, async () => {
      const { key, value } = await this._set();

      const cache = await this._service.get(key);

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

      const item = await this._service.get(
        options.isKeyNotExists ? Utils.getUUID() : key,
      );

      // Checkout response

      if (options.isKeyNotExists) {
        expect(item).toBeNull();
        return;
      }

      expect(item).toBe(value);
    });
  }

  getKeys() {
    const info = 'Simple request';

    it(info, async () => {
      await this._service.clear();

      const keysMock: string[] = [];

      for (let i = 0; i < 10; i++) {
        const { key } = await this._set();

        keysMock.push(key);
      }

      const keys = await this._service.getKeys();

      expect(keys.length).toBe(keysMock.length);
    });
  }

  remove() {
    const info = 'Simple request';

    it(info, async () => {
      const keysMock: string[] = [];

      for (let i = 0; i < 10; i++) {
        const { key } = await this._set();

        keysMock.push(key);
      }

      await this._service.remove(keysMock[0]);
      const keys = await this._service.getKeys();

      expect(keys.length).toBe(keysMock.length - 1);
    });
  }

  clear() {
    const info = 'Simple request';

    it(info, async () => {
      for (let i = 0; i < 10; i++) {
        const { key } = await this._set();
      }

      await this._service.clear();
      const keys = await this._service.getKeys();

      expect(keys.length).toBe(0);
    });
  }

  private async _set() {
    const key = Utils.getUUID();
    const value = Utils.getUUID();

    await this._service.set(key, value);

    return {
      key,
      value,
    };
  }
}

const test = new LocalStorageServiceTest();
test.run();
