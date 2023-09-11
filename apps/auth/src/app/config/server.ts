export default {
  base_url: process.env.BASE_URL,
  route_prefix: process.env.ROUTE_PREFIX,
  port: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3001,
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
};
