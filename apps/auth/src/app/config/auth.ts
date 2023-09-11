export default {
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      lifetime: process.env.JWT_ACCESS_LIFETIME
        ? Number(process.env.JWT_ACCESS_LIFETIME)
        : 86400,
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      lifetime: process.env.JWT_REFRESH_LIFETIME
        ? Number(process.env.JWT_REFRESH_LIFETIME)
        : 2592000,
    },
  },
};
