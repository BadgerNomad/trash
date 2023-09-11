import { EntityRepository, SelectQueryBuilder } from 'typeorm';

import BaseRepository from '@libs/utils/base.repository';

import User from '../entities/user.entity';

export interface IUserFilter {
  id?: number;
  email?: string;
}

@EntityRepository(User)
export default class UserRepository extends BaseRepository<
  User,
  IUserFilter,
  any,
  any,
  any,
  any
> {
  protected override _filterBuild(
    query: SelectQueryBuilder<User>,
    filter: IUserFilter,
  ) {
    if (filter.email) {
      query.andWhere({ email: filter.email });
    }

    if (filter.id) {
      query.andWhere({ user_id: filter.id });
    }

    return query;
  }
}
