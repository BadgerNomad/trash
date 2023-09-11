import { plainToClass } from 'class-transformer';
import {
  registerDecorator,
  validateSync,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function ValidateNested(
  schema: new () => any,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'ValidateNested',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              if (validateSync(plainToClass(schema, value[i])).length) {
                return false;
              }
            }

            return true;
          } else
            return validateSync(plainToClass(schema, value)).length
              ? false
              : true;
        },
        defaultMessage(args) {
          if (Array.isArray(args.value)) {
            for (let i = 0; i < args.value.length; i++) {
              return (
                `${args.property}::index${i} -> ` +
                validateSync(plainToClass(schema, args.value[i]))
                  .map((e) => e.constraints)
                  .reduce((acc, next) => acc.concat(Object.values(next)), [])
              ).toString();
            }
          } else
            return (
              `${args.property}: ` +
              validateSync(plainToClass(schema, args.value))
                .map((e) => e.constraints)
                .reduce((acc, next) => acc.concat(Object.values(next)), [])
            ).toString();
        },
      },
    });
  };
}
