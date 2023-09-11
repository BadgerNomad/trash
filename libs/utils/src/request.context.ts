import { Session } from '@libs/types/base.dto';
import * as cls from 'cls-hooked';
import { IncomingMessage } from 'http';

import Utils from './utils';
import { Response } from 'express';

export default class RequestContext {
  static namespace = Utils.getUUID();

  private readonly _request: IncomingMessage;
  private readonly _response: Response;

  constructor(request: IncomingMessage, response: Response) {
    this._request = request;
    this._response = response;
  }

  public static currentRequestContext(): RequestContext {
    const session = cls.getNamespace(RequestContext.namespace);

    if (session && session.active) {
      return session.get(RequestContext.name);
    }

    return null;
  }

  public static currentAuthSession(): Session {
    const requestContext = RequestContext.currentRequestContext();

    if (requestContext) {
      const user = requestContext._request['user'];

      return user;
    }

    return null;
  }
}
