import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import ResponseInterceptor from 'apps/auth/src/app/interceptors/app.response.interceptor';
import AppExceptionsFilter from '@libs/utils/app.exceptions.filter';
import AppValidationPipe from '@libs/utils/app.validation.pipe';
import { useContainer } from 'class-validator';
import helmet from 'helmet';

import AppModule from './app/app.module';
import config from './app/config/config';
import swaggerConfig from './app/config/swagger.config';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

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

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup(
    `${config.server.route_prefix}${config.swagger.prefix}`,
    app,
    document,
  );

  app.enableCors(config.server.cors);
  app.use(helmet());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(config.server.port);
};

void bootstrap();
