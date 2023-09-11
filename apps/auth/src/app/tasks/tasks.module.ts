import { Global, Module } from '@nestjs/common';
import { TasksFactoryModule } from '@libs/tasks';

@Global()
@Module({
  imports: [TasksFactoryModule],
})
export default class TasksModule {}
