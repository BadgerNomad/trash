import { HttpException, HttpStatus } from '@nestjs/common';

import {
  BadRequestExceptionMessage,
  ForbiddenExceptionMessage,
  NotFoundExceptionMessage,
  TooManyRequestsMessage,
  UnauthorizedExceptionMessage,
} from './exceptions.constants';

export class NotFoundException extends HttpException {
  constructor(
    message: NotFoundExceptionMessage = NotFoundExceptionMessage.NOT_FOUND,
  ) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class BadRequestException extends HttpException {
  constructor(
    message: BadRequestExceptionMessage = BadRequestExceptionMessage.BAD_REQUEST,
  ) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ForbiddenException extends HttpException {
  constructor(
    message: ForbiddenExceptionMessage = ForbiddenExceptionMessage.NOT_VERIFY,
  ) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(
    message: UnauthorizedExceptionMessage = UnauthorizedExceptionMessage.UNAUTHORIZED,
  ) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export interface TooManyRequestsResponse {
  message: TooManyRequestsMessage;
  retryAfter: number;
}

export class TooManyRequestsException extends HttpException {
  constructor(
    message: TooManyRequestsMessage = TooManyRequestsMessage.TOO_MANY_REQUESTS,
    retryAfter: number,
  ) {
    super(
      {
        message,
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  override getResponse(): TooManyRequestsResponse {
    const response = <TooManyRequestsResponse>super.getResponse();

    return response;
  }
}
