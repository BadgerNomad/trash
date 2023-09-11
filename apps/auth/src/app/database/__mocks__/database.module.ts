import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import '@libs/utils/polyfill';

import config from '@auth/config/config';

import repositories from '../repositories';
import entities from '../entities';

const repositoryModule = TypeOrmModule.forFeature(repositories);

@Global()
@Module({})
export default class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: config.database.connection.host,
          port: config.database.connection.port,
          username: config.database.connection.username,
          password: config.database.connection.password,
          database: config.database.connection.database,
          schema: 'auth',
          entities: entities,
          synchronize: false,
          cache: false,
        }),
      ],
      global: true,
      exports: repositoryModule.exports,
      providers: repositoryModule.providers,
      module: DatabaseModule,
    };
  }
}
