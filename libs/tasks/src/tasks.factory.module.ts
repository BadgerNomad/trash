import { Inject, OnModuleInit } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
})
export default class TasksFactoryModule implements OnModuleInit {
  @Inject(ModuleRef) private _moduleRef: ModuleRef;

  onModuleInit() {
    const container = this._moduleRef['container'];
    const modules = container.getModules();

    for (const module of modules) {
      for (const provider of module[1].providers) {
        try {
          const instance = this._moduleRef.get(provider[1].token, {
            strict: false,
          });

          if (!instance) {
            continue;
          }

          const prototype = provider[0]['prototype'];

          if (typeof prototype === 'undefined') {
            continue;
          }

          const methods = Object.getOwnPropertyNames(prototype);

          for (const method of methods) {
            const metadata = Reflect.getOwnMetadata(
              'IMMEDIATELY_TASK_METADATA',
              instance[method],
            );

            if (!metadata) {
              continue;
            }

            instance[method]();
          }
        } catch (err) {
          continue;
        }
      }
    }
  }
}
