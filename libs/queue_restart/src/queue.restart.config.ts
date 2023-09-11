export default {
  restart_time: process.env.QUEUE_RESTART_TIME
    ? Number(process.env.QUEUE_RESTART_TIME)
    : 3 * 1000, // 3 seconds
};
