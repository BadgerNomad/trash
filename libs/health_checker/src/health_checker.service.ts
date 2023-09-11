import { Inject, Injectable } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { RabbitHealthIndicator } from './indicators/rabbitHealthIndicator';
import { RedisHealthIndicator } from './indicators/redisHealthIndicator';

enum Transport {
  REDIS = 1,
}

export interface RedisOptions {
  transport: Transport.REDIS;
  options: {
    host: string;
    port: number;
    db?: number;
  };
}

@Injectable()
export class HealthCheckerService {
  @Inject(HealthCheckService)
  private readonly _healthCheckService: HealthCheckService;

  @Inject(TypeOrmHealthIndicator)
  private readonly _typeOrmHealthIndicator: TypeOrmHealthIndicator;

  @Inject(MemoryHealthIndicator)
  private readonly _memoryHealthIndicator: MemoryHealthIndicator;

  @Inject(DiskHealthIndicator)
  private readonly _diskHealthIndicator: DiskHealthIndicator;

  @Inject(RedisHealthIndicator)
  private readonly _redisHealthIndicator: RedisHealthIndicator;

  @Inject(RabbitHealthIndicator)
  private readonly _rabbitHealthIndicator: RabbitHealthIndicator;

  async check() {
    return this._healthCheckService.check([
      () => this.typeOrmHealth(),
      () => this.heapHealth(),
      () => this.rssHealth(),
      () => this.diskHealth(),
      () => this.redisHealth(),
      () => this.rabbitHealth(),
    ]);
  }

  private async typeOrmHealth() {
    const database = await this._typeOrmHealthIndicator.pingCheck('database');

    return database;
  }

  // the process should not use more than 300MB memory

  private async heapHealth() {
    const heap = this._memoryHealthIndicator.checkHeap(
      'memory_heap',
      300 * 1024 * 1024,
    );

    return heap;
  }

  // The process should not have more than 300MB RSS memory allocated

  private async rssHealth() {
    const heap = this._memoryHealthIndicator.checkRSS(
      'memory_RSS',
      300 * 1024 * 1024,
    );

    return heap;
  }

  private async diskHealth() {
    const disk = this._diskHealthIndicator.checkStorage('disk', {
      thresholdPercent: 0.5,
      path: '/',
    });

    return disk;
  }

  private redisHealth() {
    const redis = this._redisHealthIndicator.pingCheck('redis');

    return redis;
  }

  private rabbitHealth() {
    const rabbit = this._rabbitHealthIndicator.pingCheck('rabbit');

    return rabbit;
  }
}
