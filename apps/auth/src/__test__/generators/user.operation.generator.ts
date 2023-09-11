import { Connection } from 'typeorm';

import BaseGenerator from '@libs/utils/base.generator';
import Utils from '@libs/utils/utils';

import UserOperation, {
  IUserOperationData,
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';

export interface IUserOperationGeneratorOptions {
  user_id: number;
  type: UserOperationType;
  token?: string;
  ttl?: Date;
  data?: IUserOperationData;
}

export default class UserOperationGenerator extends BaseGenerator<UserOperation> {
  constructor(connection: Connection) {
    super(connection);
    this._repository = this._database.getRepository(UserOperation);
  }

  async userOperation(options: IUserOperationGeneratorOptions) {
    const ttl = new Date();
    ttl.setHours(ttl.getHours() + 1);

    const entity = this._repository.create({
      user_id: options.user_id,
      type: options.type,
      token: options.token ? options.token : Utils.getUUID(),
      ttl: options.ttl ? options.ttl : ttl,
      data: options.data ? options.data : null,
    });

    await this._repository.save(entity);

    return entity;
  }
}
