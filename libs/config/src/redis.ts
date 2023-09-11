import { config } from 'dotenv';
config();

export default {
  host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'localhost',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  username: process.env.REDIS_USERNAME ? process.env.REDIS_USERNAME : undefined,
  password: process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD : undefined,
  db: process.env.REDIS_DATABASE
    ? Number(process.env.REDIS_DATABASE)
    : undefined,
  url: process.env.REDIS_LINK ? process.env.REDIS_LINK : 'redis://localhost',
};
