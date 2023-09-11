# Streaming()

Project allow to create invoices and apply payments.

### Requirements

1. NodeJS 16
1. PostgreSQL 12 (Main database storage)
1. Redis (Sessions storage, cache, Bull)
1. RabbitMQ (Microservice messaging)

### Applications:

Each application works with its own database if the service needs to store data.
Each service must be independent and can be broken down into subprocesses (main, cron).
Note: Services do not imply inter-service imports!

1. [Auth-service](./apps/auth)

### Libraries:

Common libraries implement independent universal modules and a set of utilities that are intended to be used in different applications or from the command line.

1. [Cache](./libs/cache)
1. [Broker](./libs/broker)
1. [Config](/libs/config)
1. [Queue-restart](/libs/queue_restart)
1. [Tasks](/libs/tasks)
1. [Tools](/libs/tools)
1. [Types](/libs/types)
1. [Utils](/libs/utils)
