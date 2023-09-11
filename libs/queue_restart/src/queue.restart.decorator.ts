import { QUEUE_RESTART_METADATA } from './queue.restart.constants';

export const QueueRestart = () => {
  return function (target) {
    Reflect.defineMetadata(QUEUE_RESTART_METADATA, target.name, target);
  };
};

export default QueueRestart;
