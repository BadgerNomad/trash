import { Connection, QueryRunner } from 'typeorm';

import { Inject, Injectable } from '@nestjs/common';

import UserRepository from '@auth/database/repositories/user.repository';
import User from '@auth/database/entities/user.entity';

export interface IEmailAuthData {
  email: string;
}

export interface IEmailAuthCreateData {
  email: string;
  password: string;
}

export interface IUserUpdate {
  email?: string;
  email_verified?: boolean;
  password?: string;
}

@Injectable()
export default class UsersProcessor {
  @Inject(Connection)
  private readonly _connection: Connection;

  @Inject(UserRepository)
  private readonly _userRepository: UserRepository;

  async authData(data: IEmailAuthData): Promise<User> {
    const authData = await this._userRepository.findOne({
      where: { email: data.email.toLowerCase() },
      select: ['email', 'email_verified', 'password', 'id'],
    });

    return authData;
  }

  async create(
    data: IEmailAuthCreateData,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    const _queryRunner = queryRunner
      ? queryRunner
      : this._connection.createQueryRunner();

    if (!queryRunner) {
      await _queryRunner.startTransaction();
    }

    try {
      // Create auth data

      const user = this._userRepository.create({
        email: data.email.toLowerCase(),
        password: data.password,
        email_verified: false,
      });

      await this._userRepository.save(user, {
        queryRunner,
      });

      if (!queryRunner) {
        await _queryRunner.commitTransaction();
      }

      return user;
    } catch (err) {
      if (queryRunner) {
        throw err;
      }

      await _queryRunner.rollbackTransaction();
    } finally {
      if (!queryRunner) {
        await _queryRunner.release();
      }
    }
  }

  async update(user_id: number, data: IUserUpdate, queryRunner?: QueryRunner) {
    const userEmail = await this._userRepository.findOne({
      where: { id: user_id },
    });

    await this._userRepository.save(Object.assign(userEmail, data), {
      queryRunner,
    });
  }
}
