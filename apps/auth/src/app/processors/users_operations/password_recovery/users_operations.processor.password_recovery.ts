import { Connection, QueryRunner } from 'typeorm';

import { Inject, Injectable } from '@nestjs/common';

import User from '@auth/database/entities/user.entity';
import UserOperation, {
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';

import UserOperationRepository from '@auth/database/repositories/user_operation.repository';
import UserRepository from '@auth/database/repositories/user.repository';

import SessionsProcessor from '@auth/processors/sessions/sessions.processor';
import UsersProcessor from '@auth/processors/users/users.processor';

import config from '@auth/config/config';

import UsersOperationsProcessorAbstract, {
  IApplyPayload,
  IUsersOperationsProcessorOptions,
} from '../users_operations.abstract.processor';

export interface ICreatePayload {
  user: string | number | User;
}

export interface IApplyPasswordRecovery extends IApplyPayload {
  password: string;
}

@Injectable()
export default class UsersOperationsProcessorPasswordRecovery extends UsersOperationsProcessorAbstract {
  @Inject(UsersProcessor)
  private readonly _userProcessor: UsersProcessor;
  @Inject(SessionsProcessor)
  private readonly _sessionProcessor: SessionsProcessor;

  constructor(
    @Inject(Connection) _connection: Connection,
    @Inject(UserOperationRepository) _repository: UserOperationRepository,
    @Inject(UserRepository) _userRepository: UserRepository,
  ) {
    const options: IUsersOperationsProcessorOptions = {
      type: UserOperationType.PASSWORD_RECOVERY,
      ttlInHours: config.user_operations.password_recovery.ttl,
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
        where: { id: user },
        select: ['email_verified', 'id'],
      });
    } else {
      _user = await this._userRepository.findOne({
        where: { email: user },
        select: ['email_verified', 'id', 'email'],
      });
    }

    if (!_user || !_user.email_verified) {
      return;
    }

    const userOperation = await super.create(
      { user: _user.id, data: null },
      queryRunner,
    );

    return userOperation;
  }

  public async apply(payload: IApplyPasswordRecovery) {
    const queryRunner = this._connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const userOperation = await super.apply(payload, queryRunner);

      if (userOperation) {
        await this._userProcessor.update(
          userOperation.user_id,
          { password: payload.password },
          queryRunner,
        );

        await this._sessionProcessor.dropAll(userOperation.user_id);
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
