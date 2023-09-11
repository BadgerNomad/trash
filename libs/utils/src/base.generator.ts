import { Connection, ObjectLiteral, Repository } from 'typeorm';

export default abstract class BaseGenerator<T extends ObjectLiteral> {
  protected _database: Connection;
  protected _repository: Repository<T>;

  constructor(connection: Connection) {
    this._database = connection;
  }

  get repository() {
    return this._repository;
  }
}
