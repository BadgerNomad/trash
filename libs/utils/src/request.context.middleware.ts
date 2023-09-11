import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cls from 'cls-hooked';
import { IncomingMessage } from 'http';

import RequestContext from './request.context';
import { Response } from 'express';

@Injectable()
export default class RequestContextMiddleware implements NestMiddleware {
  use(
    req: IncomingMessage,
    res: Response,
    next: (error?: Error | unknown) => void,
  ) {
    const requestContext = new RequestContext(req, res);
    const session =
      cls.getNamespace(RequestContext.namespace) ||
      cls.createNamespace(RequestContext.namespace);

    session.run(async () => {
      session.set(RequestContext.name, requestContext);
      next();
    });
  }
}
