import { config } from 'dotenv';
config();

export default {
  key: process.env.CRYPTO_KEY,
};
