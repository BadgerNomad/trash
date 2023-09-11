import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthCheckerController } from './health_checker.controller';
import { HealthCheckerService } from './health_checker.service';
import { RabbitHealthIndicator } from './indicators/rabbitHealthIndicator';
import { RedisHealthIndicator } from './indicators/redisHealthIndicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckerController],
  providers: [
    HealthCheckerService,
    RedisHealthIndicator,
    RabbitHealthIndicator,
  ],
  exports: [HealthCheckerService],
})
@Module({})
export class HealthCheckerModule {
  // static register(): DynamicModule {
  //   return {
  //     imports: [TerminusModule],
  //     controllers: [HealthCheckerController],
  //     providers: [
  //       // { provide: '', useValue: options },
  //       HealthCheckerService,
  //       RedisHealthIndicator,
  //       RabbitHealthIndicator,
  //     ],
  //     module: HealthCheckerModule,
  //     exports: [HealthCheckerController],
  //   };
  // }
}
