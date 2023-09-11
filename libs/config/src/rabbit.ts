import { config } from 'dotenv';
config();

export default {
  url: process.env.BROKER_URL,
};
