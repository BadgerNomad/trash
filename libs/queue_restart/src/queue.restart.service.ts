import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Interval } from '@nestjs/schedule';

import { QueueRestartAbstract } from './queue.restart.abstract';
import config from './queue.restart.config';
import { QUEUE_RESTART_METADATA } from './queue.restart.constants';

@Injectable()
export default class QueueRestartService {
  private readonly _moduleRef: ModuleRef;
  private readonly _queues: {
    provider: any;
    implementation: QueueRestartAbstract<any>;
  }[];

  constructor(@Inject(ModuleRef) moduleRef: ModuleRef) {
    this._moduleRef = moduleRef;
    this._queues = [];

    const container = this._moduleRef['container'];
    const modules = container.getModules();

    for (const module of modules) {
      for (const provider of module[1].providers) {
        if (typeof provider[0] !== 'function') {
          continue;
        }

        if (Reflect.hasMetadata(QUEUE_RESTART_METADATA, provider[0])) {
          this._queues.push({
            provider: provider[0],
            implementation: null,
          });
        }
      }
    }
  }

  @Interval(config.restart_time)
  async handle() {
    for (const queue of this._queues) {
      const implementation = queue.implementation
        ? queue.implementation
        : this._moduleRef.get<QueueRestartAbstract<any>>(queue.provider, {
            strict: false,
          });
      queue.implementation = implementation;

      await implementation.restartQueue();
    }
  }
}
