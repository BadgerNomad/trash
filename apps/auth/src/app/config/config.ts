import { config } from 'dotenv';
config();

import app from '@libs/config/app';
import crypto from '@libs/config/crypto';
import database from '@libs/config/database';
import rabbit from '@libs/config/rabbit';
import redis from '@libs/config/redis';
import telegram from '@libs/config/telegram';

import auth from './auth';
import rate_limit from './rate_limit';
import server from './server';
import swagger from './swagger';
import tasks from './tasks';
import user_operations from './user_operations';
import notifications from './notifications';

export default {
  app,
  database,
  redis,
  auth,
  server,
  swagger,
  tasks,
  telegram,
  rabbit,
  crypto,
  rate_limit,
  user_operations,
  notifications,
};
