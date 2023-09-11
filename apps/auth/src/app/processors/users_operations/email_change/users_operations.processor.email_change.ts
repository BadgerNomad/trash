import { Connection, QueryRunner } from 'typeorm';

import { BadRequestException, BadRequestExceptionMessage } from '@libs/utils';

import { Inject, Injectable } from '@nestjs/common';
import config from '@auth/config/config';
import User from '@auth/database/entities/user.entity';
import UserOperation, {
  IEmailChangeData,
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';

import UserOperationRepository from '@auth/database/repositories/user_operation.repository';

import SessionsProcessor from '@auth/processors/sessions/sessions.processor';

import UsersOperationsProcessorAbstract, {
  IApplyPayload,
  IUsersOperationsProcessorOptions,
} from '../users_operations.abstract.processor';
import UsersProcessor from '@auth/processors/users/users.processor';
import UserRepository from '@auth/database/repositories/user.repository';

export interface ICreateEmailChangePayload {
  user: number | string | User;
  data: IEmailChangeData;
}

@Injectable()
export default class UsersOperationsProcessorEmailChange extends UsersOperationsProcessorAbstract {
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
      type: UserOperationType.EMAIL_CHANGE,
      ttlInHours: config.user_operations.email_change.ttl,
    };

    super(_connection, _repository, _userRepository, options);
  }

  public async create(
    payload: ICreateEmailChangePayload,
    queryRunner?: QueryRunner,
  ): Promise<UserOperation> {
    const { user, data } = payload;
    let _user: User;

    if (user instanceof User) {
      _user = user;
    } else if (typeof user === 'number') {
      _user = await this._userRepository.findOne({
        where: { id: user },
        select: ['id', 'email_verified', 'password', 'email'],
      });
    } else {
      _user = await this._userRepository.findOne({
        where: { email: user },
        select: ['id', 'email_verified', 'password', 'email'],
      });
    }

    if (!_user || !_user.password) {
      return;
    }

    await this._checkoutEmail(data.email);

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
        const data = <IEmailChangeData>userOperation.data;

        await this._checkoutEmail(data.email);

        await this._userProcessor.update(
          userOperation.user_id,
          { email: data.email },
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

  private async _checkoutEmail(email: string) {
    const isEmail = await this._userRepository.count({
      where: { email: email },
    });

    if (isEmail) {
      throw new BadRequestException(
        BadRequestExceptionMessage.USER_ALREADY_EXISTS,
      );
    }
  }
}
