import { Global, Module } from '@nestjs/common';
import { HealthCheckerModule } from '@libs/health_checker';

import ValidatorsModule from '@auth/validators/validators.module';

import V1Module from './v1/v1.module';
import RateLimitModule from './rate_limit/rate_limit.module';

@Global()
@Module({
  imports: [V1Module, RateLimitModule, ValidatorsModule, HealthCheckerModule],
})
export default class RoutesModule {}
