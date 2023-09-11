import { NestFactory } from '@nestjs/core';

import CronModule from './app/cron.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CronModule);
  app.enableShutdownHooks();

  await app.init();
}

void bootstrap();
