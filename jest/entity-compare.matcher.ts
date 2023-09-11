import { expect, } from '@jest/globals';
import type { MatcherFunction, } from 'expect';
import { BaseEntity, } from 'typeorm';

const isSkipProperty = (
  entity: BaseEntity,
  property: string,
  entityClass?: typeof BaseEntity
) => {
  const value = entity[property];

  if (
    Array.isArray(value) ||
    value instanceof BaseEntity ||
    typeof value === 'function' ||
    typeof property === 'undefined' ||
    value === null ||
    typeof value === 'undefined' ||
    property === 'created_at' ||
    property === 'updated_at'
  ) {
    return true;
  }

  if (!entityClass) {
    return false;
  }

  const metadata = Reflect.getOwnMetadata(
    'design:type',
    entityClass.prototype,
    property
  );

  if (!metadata) {
    return false;
  }

  return (
    Array.isArray(metadata.prototype) ||
    metadata.prototype instanceof BaseEntity
  );
};

const valueCompare = (valueA: any, valueB) => {
  if (valueA instanceof Date) {
    if (valueA.getTime() !== valueB.getTime()) {
      return false;
    }
  } else if (typeof valueA === 'object') {
    const isAllProperty =
      Object.keys(valueA).length === Object.keys(valueB).length;

    if (!isAllProperty) {
      return false;
    }

    for (const property in valueA) {
      const _valueA = valueA[property];
      const _valueB = valueB[property];

      const isEqual = valueCompare(_valueA, _valueB);

      if (!isEqual) {
        return false;
      }
    }
  } else if (valueA !== valueB) {
    return false;
  }

  return true;
};

const entityFormat = (
  entityA: BaseEntity,
  entityB: BaseEntity,
  entityClass?: typeof BaseEntity
) => {
  const _entityA = {};

  for (const property in entityA) {
    if (isSkipProperty(entityA, property, entityClass)) {
      continue;
    }

    const value = entityA[property];

    const isMustBeDate =
      typeof value === 'string' && entityB[property] instanceof Date;

    _entityA[property] = isMustBeDate ? new Date(value) : value;
  }

  return _entityA;
};

const toEntityCompare: MatcherFunction<
[data: BaseEntity | BaseEntity[], entityClass?: typeof BaseEntity]
> = function (
  actual: BaseEntity | BaseEntity[],
  data: BaseEntity | BaseEntity[],
  entityClass?: typeof BaseEntity
) {
  const _actual: BaseEntity[] = [];
  const _data: BaseEntity[] = [];

  if (!Array.isArray(actual)) {
    _actual.push(actual);
  } else {
    _actual.push(...actual);
  }

  if (!Array.isArray(data)) {
    _data.push(data);
  } else {
    _data.push(...data);
  }

  let pass = true;

  const entitiesA = [];
  const entitiesB = [];

  for (const entityA of _actual) {
    const _entityA = entityFormat(entityA, _data[0], entityClass);
    entitiesA.push(_entityA);
  }

  for (const entityB of _data) {
    const _entityB = entityFormat(entityB, _actual[0], entityClass);
    entitiesB.push(_entityB);
  }

  if (_actual.length !== _data.length) {
    pass = false;
  } else {
    for (const entityB of entitiesB) {
      let isExists = false;

      for (const entityA of entitiesA) {
        isExists = valueCompare(entityA, entityB);

        if (isExists) {
          break;
        }
      }

      if (!isExists) {
        pass = false;
        break;
      }
    }
  }

  if (pass) {
    return {
      message: () =>
        this.utils.printDiffOrStringify(
          entitiesB,
          entitiesA,
          'expected',
          'received',
          true
        ),
      pass: true,
    };
  } else {
    return {
      message: () =>
        this.utils.printDiffOrStringify(
          entitiesB,
          entitiesA,
          'expected',
          'received',
          true
        ),
      pass: false,
    };
  }
};

expect.extend({
  toEntityCompare,
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toEntityCompare(
      data: BaseEntity | BaseEntity[],
      entityClass?: typeof BaseEntity,
    ): void;
  }
  interface Matchers<R> {
    toEntityCompare(
      data: BaseEntity | BaseEntity[],
      entityClass?: typeof BaseEntity,
    ): R;
  }
}
