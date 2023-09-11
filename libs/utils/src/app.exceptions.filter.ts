import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { TooManyRequestsResponse } from './exceptions/app.exceptions';

export interface IResponseError {
  ok: false;
  result: {
    statusCode: HttpStatus;
    timestamp: string;
    message: string | object;
  };
}

export interface IOptions {
  isDebug: boolean;
}

@Catch()
export default class AppExceptionsFilter implements ExceptionFilter {
  private readonly _adapter: HttpAdapterHost;

  private readonly _options: IOptions;

  constructor(adapter: HttpAdapterHost, options: IOptions) {
    this._adapter = adapter;
    this._options = options;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this._adapter;

    if (this._options.isDebug && !(exception instanceof HttpException)) {
      console.error(exception);
    }

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const httpResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const responseBody: IResponseError = {
      ok: false,
      result: {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        message: httpResponse ? httpResponse.toString() : null,
      },
    };

    if (httpResponse && httpResponse['message']) {
      responseBody.result.message = httpResponse['message'];
    }

    if (httpStatus === HttpStatus.TOO_MANY_REQUESTS) {
      const response = <TooManyRequestsResponse>httpResponse;

      responseBody.result.message = response.message;

      if (response.retryAfter) {
        httpAdapter.setHeader(
          ctx.getResponse(),
          'retry-after',
          response.retryAfter.toString(),
        );
      }
    }

    if (httpStatus === HttpStatus.SERVICE_UNAVAILABLE) {
      responseBody.result.message = httpResponse;
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
