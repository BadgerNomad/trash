# Tasks library

Realize schedule module.

### Usage

```
@Global()
@Module({
  imports: [
    TasksFactoryModule,
    Task1Module,
    ...
    TaskNModule,
  ],
})
export default class TasksModule {}
```

## Immediately task

Decorator ImmediatelyTask produce calling task method with starting server.

### Usage

```
@ImmediatelyTask()
@Interval(10000)
async handleInterval() {
  this._logger.log('Start');
  ...
  this._logger.log('End');
}
```

#### Notice!

Task must contains exception handler, otherwise server will be breakout with exception.