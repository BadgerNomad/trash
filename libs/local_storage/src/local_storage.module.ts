import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  ILocalStorageConfig,
  LOCAL_STORAGE_CONFIG,
} from './local_storage.constants';
import LocalStorageService from './local_storage.service';

@Module({})
export class LocalStorageModule implements OnModuleInit {
  @Inject(ModuleRef) private _moduleRef: ModuleRef;

  static register(options: ILocalStorageConfig): DynamicModule {
    return {
      providers: [
        {
          provide: LOCAL_STORAGE_CONFIG,
          useValue: options,
        },
        LocalStorageService,
      ],
      module: LocalStorageModule,
      exports: [LocalStorageService],
    };
  }

  async onModuleInit() {
    const storage = this._moduleRef.get(LocalStorageService);
    await storage.init();
  }
}
