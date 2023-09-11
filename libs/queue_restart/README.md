# Queue restart library

Module for restarting failed queues by schedule.
'removeOnFail' must be set to false in global or for queue. Example:

```
defaultJobOptions: {
  removeOnFail: false,
  attempts: 1,
  ....
},
```

Service must be extends on extends QueueRestartAbstract. Example:

```
export default class SimpleQueueService extends QueueRestartAbstract<SimpleQueuePayload> { ... }
```

Schedule module must import QueueRestartModule. Example:

```
import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import QueueRestartModule from '@libs/queue_restart/queue.restart.module';

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), QueueRestartModule],
})
export default class TasksModule {}
```