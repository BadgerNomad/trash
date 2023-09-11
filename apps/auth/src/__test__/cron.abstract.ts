import { INestApplication } from '@nestjs/common';

export default abstract class CronAbstract {
  protected _app: INestApplication;
}
