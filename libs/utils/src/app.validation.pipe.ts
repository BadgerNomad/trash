import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export default class AppValidationPipe
  extends ValidationPipe
  implements PipeTransform<any>
{
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);

    if (errors.length) {
      const messages = errors.map((err) => {
        return `${err.property}: ${Object.values(err.constraints).join(', ')}`;
      });

      throw new HttpException(messages.join(', '), HttpStatus.BAD_REQUEST);
    }

    return super.transform(value, metadata);
  }
}
