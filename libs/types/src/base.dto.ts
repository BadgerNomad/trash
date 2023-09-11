import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http2';

export interface RequestAuth extends Request {
  user: Session;
}

export interface Session {
  id: string;
  userId: number;
  organizationId?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequestSession extends Request {
  headers: IRequestHeaders;
}

export interface IRequestHeaders extends IncomingHttpHeaders {
  'user-agent': string;
  'x-forwarded-for': string;
  recaptcha: string;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface IPagination {
  take?: number;
  skip?: number;
}

export interface ISort<T> {
  orderBy?: Order;
  sortBy?: T;
}

export class PaginationDto {
  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number = 0;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  take?: number = 10;
}

export abstract class SortDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  orderBy?: Order = Order.ASC;

  @ApiPropertyOptional({})
  @IsString()
  @IsOptional()
  sortBy?: string;
}

export class DateFilterDto {
  @ApiPropertyOptional({
    name: 'from',
    type: Date,
    example: '2020-06-15T10:30:50.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from?: Date;

  @ApiPropertyOptional({
    name: 'to',
    type: Date,
    example: '2020-06-15T10:30:50.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to?: Date;
}

export const RegExValidation = {
  ONLY_CHARACTERS_WITH_DASH: /^[A-Za-z\s]+([-`'][A-Za-z\s]+)*$/,
  CHARACTERS_WITH_NUMBERS_AND_AT: /^@?[^#@:]{2,32}#[0-9]{4}$/,
  CHARACTERS_WITH_SYMBOLS_AND_SPACE:
    /^[a-zA-ZàáäåãâÀÁÄÅÃÂéèëêÉÈËÊîíìïÎÍÌÏôõóòöÔÕÓÒÖûúùüÛÚÙÜŸÿœŒñÑçÇа-яА-ЯЁё0-9!`@#$%^\s&*()_+-=}{\[\]"|':;?><,.\\]*$/,
  CHARACTERS_WITH_SYMBOLS: /^[a-zA-Z0-9!`@#$%^&*()_+-=}{\[\]"|':;?><,./\\]*$/,
  BLOCKCHAIN_HASH: /^(0x)?[a-f0-9]{64,66}$/,
  CHARACTERS_WITH_NUMBERS_AND_SYMBOLS_REQUIRED:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+-=}{\[\]"|':;`?><,.\\])[A-Za-z\d!@#$%^&*()_+-=}{\[\]"|':;`?><,.\\]{8,}$/,
};
