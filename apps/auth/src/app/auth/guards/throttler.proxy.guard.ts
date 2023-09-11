import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { IRequestHeaders } from '@libs/types/base.dto';
import { Request } from 'express';

// TODO rework app.set('trust proxy', 'cloudflare') and req.ips

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Request): string {
    const headers = <IRequestHeaders>req.headers;
    const ip = headers['x-forwarded-for'] ?? req.ip;

    return ip;
  }
}
