import request from 'supertest';
import { Connection } from 'typeorm';

import { INestApplication } from '@nestjs/common';

import { IResponseError } from '@libs/utils';

import config from '@auth/config/config';

export interface IResponse<T> {
  status: number;
  headers: string[];
  body?:
    | IResponseError
    | {
        ok: boolean;
        result: T;
      };
}

export type ObjectLiteral<T> = {
  [Property in keyof T]: string;
};

export interface IQueryParams {
  [param: string]: any;
}

export default abstract class MainAbstract {
  protected _app: INestApplication;
  protected _server;
  protected _database: Connection;

  async get<T>(
    url: string,
    auth?: string,
    query?: IQueryParams,
    params?: ObjectLiteral<T>,
  ): Promise<IResponse<T>> {
    let urlWithParams = url;

    if (params) {
      const key = Object.keys(params)[0];
      const regex = new RegExp(':' + key);

      urlWithParams = url.replace(regex, params[key]);
    }

    const req = request(this._server).get(
      `${config.server.route_prefix}${urlWithParams}`,
    );

    if (query !== undefined) {
      await req.query({ ...query });
    }

    if (auth) {
      await req.auth(auth, { type: 'bearer' });
    }

    return req;
  }

  async post<T>(
    url: string,
    data: object | string,
    auth?: string,
  ): Promise<IResponse<T>> {
    let req = request(this._server)
      .post(`${config.server.route_prefix}${url}`)
      .send(data);

    if (auth) {
      req = req.auth(auth, { type: 'bearer' });
    }

    return req;
  }

  async put<T>(
    url: string,
    data: object | string,
    auth?: string,
    query?: IQueryParams,
  ): Promise<IResponse<T>> {
    let req = request(this._server)
      .put(`${config.server.route_prefix}${url}`)
      .send(data);

    if (auth) {
      req = req.auth(auth, { type: 'bearer' });
    }

    if (query !== undefined) {
      void req.query({ ...query });
    }

    return req;
  }

  async delete<T>(
    url: string,
    data: object | string,
    auth?: string,
  ): Promise<IResponse<T>> {
    let req = request(this._server)
      .delete(`${config.server.route_prefix}${url}`)
      .send(data);

    if (auth) {
      req = req.auth(auth, { type: 'bearer' });
    }

    return req;
  }
}
