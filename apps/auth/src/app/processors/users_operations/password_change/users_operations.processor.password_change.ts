import { Connection, QueryRunner } from 'typeorm';

import { Inject, Injectable } from '@nestjs/common';

import User from '@auth/database/entities/user.entity';
import UserOperation, {
  IPasswordChangeData,
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';

import UserOperationRepository from '@auth/database/repositories/user_operation.repository';
import UserRepository from '@auth/database/repositories/user.repository';

import SessionsProcessor from '@auth/processors/sessions/sessions.processor';
import UsersProcessorNative from '@auth/processors/users/users.processor';

import config from '@auth/config/config';

import UsersOperationsProcessorAbstract, {
  IApplyPayload,
  IUsersOperationsProcessorOptions,
} from '../users_operations.abstract.processor';

export interface ICreatePasswordChangePayload {
  user: number | string | User;
  data: IPasswordChangeData;
}

@Injectable()
export default class UsersOperationsProcessorPasswordChange extends UsersOperationsProcessorAbstract {
  @Inject(UsersProcessorNative)
  private readonly _userProcessor: UsersProcessorNative;
  @Inject(SessionsProcessor)
  private readonly _sessionProcessor: SessionsProcessor;

  constructor(
    @Inject(Connection) _connection: Connection,
    @Inject(UserOperationRepository) _repository: UserOperationRepository,
    @Inject(UserRepository) _userRepository: UserRepository,
  ) {
    const options: IUsersOperationsProcessorOptions = {
      type: UserOperationType.PASSWORD_CHANGE,
      ttlInHours: config.user_operations.password_change.ttl,
    };

    super(_connection, _repository, _userRepository, options);
  }

  public async create(
    payload: ICreatePasswordChangePayload,
    queryRunner?: QueryRunner,
  ): Promise<UserOperation> {
    const { user, data } = payload;
    let _user: User;

    if (user instanceof User) {
      _user = user;
    } else if (typeof user === 'number') {
      _user = await this._userRepository.findOne({
        where: { user_id: user },
        select: ['id', 'email_verified'],
      });
    } else {
      _user = await this._userRepository.findOne({
        where: { email: user },
        select: ['id', 'email_verified', 'email'],
      });
    }

    if (!_user) {
      return;
    }

    const userOperation = await super.create(
      { user: _user.id, data },
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
        const data = <IPasswordChangeData>userOperation.data;

        await this._userProcessor.update(
          userOperation.user_id,
          { password: data.password },
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
