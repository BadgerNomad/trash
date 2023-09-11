import { Inject, Injectable } from '@nestjs/common';
import * as storage from 'node-persist';

import {
  ILocalStorageConfig,
  LOCAL_STORAGE_CONFIG,
} from './local_storage.constants';

// TODO ADDED GENERIC

@Injectable()
export default class LocalStorageService {
  private readonly _options: ILocalStorageConfig;

  private _storage: storage.LocalStorage;

  constructor(@Inject(LOCAL_STORAGE_CONFIG) options: ILocalStorageConfig) {
    this._options = options;

    this._storage = storage.create({
      dir: this._options.path,
    });
  }

  async init() {
    await this._storage.init();
  }

  async set(key: string, value: any, options?: storage.DatumOptions) {
    await this._storage.setItem(key, value, options);
  }

  async get<T>(key: string) {
    const item = <T>await this._storage.getItem(key);

    if (!item) {
      return null;
    }

    return item;
  }

  async getKeys() {
    const keys = await this._storage.keys();

    return keys;
  }

  async remove(key: string) {
    await this._storage.removeItem(key);
  }

  async clear() {
    await this._storage.clear();
  }
}
