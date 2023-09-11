import { config } from 'dotenv';
config();

export default {
  base_url: process.env.BASE_URL,
  debug: process.env.DEBUG ? Boolean(process.env.DEBUG) : false,
};
