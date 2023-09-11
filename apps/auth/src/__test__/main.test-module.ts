import helmet from 'helmet';
import { useContainer } from 'class-validator';

import { APP_GUARD, HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import AppExceptionsFilter from '@libs/utils/app.exceptions.filter';
import AppValidationPipe from '@libs/utils/app.validation.pipe';

import config from '@auth/config/config';
import AppModule from '@auth/app.module';
import RateLimitModule from '@auth/routes/rate_limit/rate_limit.module';
import ResponseInterceptor from '@auth/interceptors/app.response.interceptor';

jest.mock('@auth/database/database.module');
jest.mock('@libs/broker/broker.client');

export default async function ApplicationTestModule() {
  // Create module

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  // Mock throttler guard

  const moduleRef = moduleFixture.get<ModuleRef>(ModuleRef);
  const container = moduleRef['container'];
  const modules = container.getModules();

  for (const module of modules) {
    const [, moduleInfo] = module;
    const metatype = moduleInfo.metatype;

    if (metatype === RateLimitModule) {
      const providers = moduleInfo.providers;

      for (const providerToken of providers.keys()) {
        const isAppGuard = providerToken.toString().includes(APP_GUARD);

        if (isAppGuard) {
          const provider = <InstanceWrapper<ThrottlerGuard>>(
            providers.get(providerToken)
          );

          provider.instance.canActivate = async () => true;
          break;
        }
      }
    }
  }

  const app = moduleFixture.createNestApplication();

  const adapter = app.get(HttpAdapterHost);
  const exceptionFilter = new AppExceptionsFilter(adapter, {
    isDebug: config.app.debug,
  });

  app.useGlobalFilters(exceptionFilter);
  app.enableShutdownHooks();
  app.setGlobalPrefix(config.server.route_prefix);

  const validatorPipe = new AppValidationPipe({
    transform: true,
  });

  app.useGlobalPipes(validatorPipe);

  const responseInterceptor = new ResponseInterceptor();
  app.useGlobalInterceptors(responseInterceptor);

  app.enableCors(config.server.cors);
  app.use(helmet());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.init();

  return app;
}
