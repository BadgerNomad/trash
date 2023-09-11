import { Test } from '@nestjs/testing';

import CronModule from '../app/cron.module';

jest.mock('@auth/database/database.module');
jest.mock('@libs/broker/broker.client');

jest.mock('@nestjs/schedule/dist/decorators/interval.decorator', () => {
  return {
    Interval: () => () => void 0,
  };
});
jest.mock('@libs/tasks/immediately.task.decorator', () => {
  return () => () => void 0;
});

export default async function CronTestModule() {
  const moduleFixture = await Test.createTestingModule({
    imports: [CronModule],
  }).compile();

  const app = moduleFixture.createNestApplication(null, {
    logger: false,
  });

  await app.init();
  return app;
}
