import { Inject, Injectable } from '@nestjs/common';

import UserOperation, {
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';
import { Connection, QueryRunner } from 'typeorm';

import User from '@auth/database/entities/user.entity';
import UserRepository from '@auth/database/repositories/user.repository';
import UserOperationRepository from '@auth/database/repositories/user_operation.repository';

import UsersProcessor from '@auth/processors/users/users.processor';

import config from '@auth/config/config';

import UsersOperationsProcessorAbstract, {
  IApplyPayload,
  IUsersOperationsProcessorOptions,
} from '../users_operations.abstract.processor';

export interface ICreatePayload {
  user: number | string | User;
}

@Injectable()
export default class UsersOperationsProcessorSignUp extends UsersOperationsProcessorAbstract {
  @Inject(UsersProcessor)
  private readonly _userProcessor: UsersProcessor;

  constructor(
    @Inject(Connection) _connection: Connection,
    @Inject(UserOperationRepository) _repository: UserOperationRepository,
    @Inject(UserRepository) _userRepository: UserRepository,
  ) {
    const options: IUsersOperationsProcessorOptions = {
      type: UserOperationType.SIGN_UP,
      ttlInHours: config.user_operations.sign_up.ttl,
    };

    super(_connection, _repository, _userRepository, options);
  }

  public async create(
    payload: ICreatePayload,
    queryRunner?: QueryRunner,
  ): Promise<UserOperation> {
    const { user } = payload;
    let _user: User;

    if (user instanceof User) {
      _user = user;
    } else if (typeof user === 'number') {
      _user = await this._userRepository.findOne({
        where: { user_id: user },
      });
    } else {
      _user = await this._userRepository.findOne({
        where: { email: user },
      });
    }

    if (!_user || _user.email_verified) {
      return;
    }

    const userOperation = await super.create(
      { user: _user.id, data: null },
      queryRunner,
    );

    return userOperation;
  }

  public async apply(payload: IApplyPayload) {
    const queryRunner = this._connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const userOperation = await super.apply(payload, queryRunner);

      if (userOperation) {
        await this._userProcessor.update(
          userOperation.user_id,
          { email_verified: true },
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

      return userOperation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
