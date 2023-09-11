import { config } from 'dotenv';
config();

export default {
  coinmarketcap: {
    baseUrl: process.env.COINMARKETCAP_URL,
    apiKey: process.env.COINMARKETCAP_API_KEY,
    currencyLimit: Number(process.env.COINMARKETCAP_CURRENCY_LIMIT),
  },
  coingecko: {
    baseUrl: process.env.COINGECKO_URL,
    apiKey: process.env.COINGECKO_API_KEY,
    currencyLimit: Number(process.env.COINGECKO_CURRENCY_LIMIT),
  },
};
