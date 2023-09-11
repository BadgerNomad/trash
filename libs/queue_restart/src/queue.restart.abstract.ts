import Bull from 'bull';

import QueueRestart from './queue.restart.decorator';

@QueueRestart()
export abstract class QueueRestartAbstract<T> {
  protected readonly _queue: Bull.Queue<T>;
  protected readonly _refreshTime: number;

  protected constructor(queue: Bull.Queue<T>, refreshTime: number) {
    this._queue = queue;
    this._refreshTime = refreshTime;
  }

  abstract add(data: any, options?: Bull.JobOptions): Promise<void>;

  async restartQueue(): Promise<void> {
    const limit = 100;
    let offset = 0;

    while (true) {
      const jobs = await this._queue.getFailed(offset, limit);

      if (!jobs.length) {
        break;
      }

      for (const job of jobs) {
        const timeLeft = Date.now() - job.finishedOn;

        if (timeLeft < this._refreshTime) {
          continue;
        }

        await job.retry();
      }

      offset += limit;
    }
  }
}
