import { DynamicModule, Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import '@libs/utils/polyfill';

import config from '@auth/config/config';

import repositories from './repositories';
import entities from './entities';

export interface IDatabaseOptions {
  cache?: boolean;
}

const repositoryModule = TypeOrmModule.forFeature(repositories);

@Global()
@Module({})
export default class DatabaseModule {
  static forRoot(options: IDatabaseOptions = {}): DynamicModule {
    if (typeof options.cache === 'undefined') {
      options.cache = config.database.cache.enabled;
    }

    return {
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: config.database.connection.host,
          port: config.database.connection.port,
          username: config.database.connection.username,
          password: config.database.connection.password,
          database: config.database.connection.database,
          entities: entities,
          schema: 'auth',
          synchronize: false,
          logging: true,
          maxQueryExecutionTime: 1000,
          logger: 'advanced-console',
          cache: options.cache
            ? {
                type: 'redis',
                options: { ...config.redis },
                duration: config.database.cache.duration,
              }
            : false,
        }),
      ],
      global: true,
      exports: repositoryModule.exports,
      providers: repositoryModule.providers,
      module: DatabaseModule,
    };
  }
}
