import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';

import { HealthCheckerService } from './health_checker.service';

@Controller('health')
export class HealthCheckerController {
  @Inject(HealthCheckerService)
  private readonly _service: HealthCheckerService;

  @Get()
  @HealthCheck()
  async check() {
    const health = await this._service.check();

    return health;
  }
}
