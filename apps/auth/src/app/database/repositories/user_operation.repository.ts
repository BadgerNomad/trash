import BaseRepository, { ISort, JoinType } from '@libs/utils/base.repository';
import { EntityRepository, LessThanOrEqual, SelectQueryBuilder } from 'typeorm';

import UserOperation, {
  UserOperationType,
} from '../entities/user_operation.entity';

export interface IUserOperationsFilter {
  user_id?: number;
  type?: UserOperationType;
  token?: string;
  ttl?: Date;
}

export type UserOperationJoinable = 'users';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserOperationJoinVariables {}

export enum UserOperationAttributesSort {
  CREATED_AT = 'users_operations.created_at',
}

@EntityRepository(UserOperation)
export default class UserOperationRepository extends BaseRepository<
  UserOperation,
  IUserOperationsFilter,
  UserOperationJoinable,
  IUserOperationJoinVariables,
  any,
  UserOperationAttributesSort
> {
  protected override _filterBuild(
    query: SelectQueryBuilder<UserOperation>,
    filter: IUserOperationsFilter,
  ) {
    if (filter.user_id) {
      query.andWhere({ user_id: filter.user_id });
    }

    if (filter.type) {
      query.andWhere({ type: filter.type });
    }

    if (filter.token) {
      query.andWhere({ token: filter.token });
    }

    if (filter.ttl) {
      query.andWhere({ ttl: LessThanOrEqual(filter.ttl) });
    }

    return query;
  }

  protected override _joinBuild(
    query: SelectQueryBuilder<UserOperation>,
    tables: UserOperationJoinable[],
    type: JoinType,
    variables?: IUserOperationJoinVariables,
  ) {
    if (!tables) {
      return;
    }

    const alias = query.alias;

    for (const table of tables) {
      switch (table) {
        case 'users': {
          const method =
            type === 'inner' ? 'innerJoinAndMapOne' : 'leftJoinAndMapOne';

          query[method](
            `${alias}.users`,
            'users',
            'users',
            `${alias}.user_id = users.id`,
          );

          break;
        }
      }

      return query;
    }
  }

  protected _sortBuild(
    query: SelectQueryBuilder<UserOperation>,
    sorts: ISort<UserOperationAttributesSort>[],
  ) {
    for (const sort of sorts) {
      query.addOrderBy(sort.sortBy, sort.orderBy);
    }
  }
}
