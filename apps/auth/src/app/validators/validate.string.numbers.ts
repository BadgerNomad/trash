import BigNumber from 'bignumber.js';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function MinString(
  min: number | string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'MinString',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          return new BigNumber(value).gte(min);
        },
        defaultMessage(args) {
          return `value lower than ${min}`;
        },
      },
    });
  };
}
