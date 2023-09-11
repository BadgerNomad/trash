import { Connection, QueryRunner } from 'typeorm';

import { Injectable } from '@nestjs/common';

import Utils from '@libs/utils/utils';

import UserRepository from '@auth/database/repositories/user.repository';
import UserOperationRepository from '@auth/database/repositories/user_operation.repository';
import UserOperation, {
  IUserOperationData,
  UserOperationType,
} from '@auth/database/entities/user_operation.entity';

export interface IUsersOperationsProcessorOptions {
  type: UserOperationType;
  ttlInHours: number;
}

export interface ICreatePayload {
  user: number;
  data: IUserOperationData;
}

export interface IApplyPayload {
  token: string;
}

@Injectable()
export default abstract class UsersOperationsProcessorAbstract {
  protected readonly _connection: Connection;
  protected readonly _userOperationRepository: UserOperationRepository;
  protected readonly _userRepository: UserRepository;

  protected readonly _type: UserOperationType;
  protected readonly _ttlInHours: number;

  constructor(
    connection: Connection,
    userOperationRepository: UserOperationRepository,
    userRepository: UserRepository,
    options: IUsersOperationsProcessorOptions,
  ) {
    this._connection = connection;
    this._userOperationRepository = userOperationRepository;
    this._userRepository = userRepository;
    this._type = options.type;
    this._ttlInHours = options.ttlInHours;
  }

  public async create(
    payload: ICreatePayload,
    queryRunner?: QueryRunner,
  ): Promise<UserOperation> {
    const _queryRunner = queryRunner
      ? queryRunner
      : this._connection.createQueryRunner();

    if (!queryRunner) {
      await _queryRunner.startTransaction();
    }

    try {
      await this._close(payload.user, _queryRunner);

      const userOperation = await this._createUserOperation(
        payload,
        _queryRunner,
      );

      if (!queryRunner) {
        await _queryRunner.commitTransaction();
      }

      return userOperation;
    } catch (error) {
      if (queryRunner) {
        throw error;
      }

      await _queryRunner.rollbackTransaction();
    } finally {
      if (!queryRunner) {
        await _queryRunner.release();
      }
    }
  }

  public async apply(
    payload: IApplyPayload,
    queryRunner?: QueryRunner,
  ): Promise<UserOperation> {
    const userOperation = await this._userOperationRepository.findOne({
      where: { token: payload.token, type: this._type },
    });

    const date = new Date();

    if (!userOperation || userOperation.ttl < date) {
      return;
    }

    await this._close(userOperation.user_id, queryRunner);

    return userOperation;
  }

  protected async _close(
    user_id: number,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const operation = await this._userOperationRepository.findOne({
      where: { user_id, type: this._type },
    });

    if (!operation) {
      return;
    }

    await this._userOperationRepository.remove(operation, { queryRunner });
  }

  protected async _createUserOperation(
    payload: ICreatePayload,
    queryRunner: QueryRunner,
  ): Promise<UserOperation> {
    const { user, data } = payload;
    const token = Utils.getUUID();

    const ttl = new Date();
    ttl.setHours(ttl.getHours() + this._ttlInHours);

    const userOperation = this._userOperationRepository.create({
      user_id: user,
      token,
      ttl,
      type: this._type,
      data,
    });

    await this._userOperationRepository.save(userOperation, {
      queryRunner: queryRunner,
    });

    return userOperation;
  }
}
