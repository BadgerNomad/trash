import { SelectQueryBuilder } from 'typeorm';

import { VIRTUAL_COLUMN_KEY } from './base.repository';

declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
    getManyAndCount(
      this: SelectQueryBuilder<Entity>,
    ): Promise<[Entity[] | undefined, number]>;

    getMany(this: SelectQueryBuilder<Entity>): Promise<Entity[] | undefined>;
    getOne(this: SelectQueryBuilder<Entity>): Promise<Entity | undefined>;
  }
}

SelectQueryBuilder.prototype.getMany = async function () {
  const { entities, raw } = await this.getRawAndEntities();

  const items = entities.map((entitiy, index) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entitiy) ?? {};
    const item = raw[index];

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entitiy[propertyKey] = item[name];
    }

    return entitiy;
  });

  return [...items];
};

SelectQueryBuilder.prototype.getManyAndCount = async function (): Promise<
  [unknown[], number]
> {
  const { entities, raw } = await this.getRawAndEntities();

  const count = await this.getCount();

  const items = entities.map((entitiy, index) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entitiy) ?? {};
    const item = raw[index];

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entitiy[propertyKey] = item[name];
    }

    return entitiy;
  });

  return [items, count];
};

SelectQueryBuilder.prototype.getOne = async function () {
  const { entities, raw } = await this.getRawAndEntities();

  const entity = typeof entities[0] === undefined ? entities[0] : [];

  const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};

  for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
    entities[0][propertyKey] = raw[0][name];
  }

  return entities[0];
};
