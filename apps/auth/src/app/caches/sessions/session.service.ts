import { Inject, Injectable } from '@nestjs/common';

import CacheService from '@libs/cache/cache.service';
import Utils from '@libs/utils/utils';

export interface Session {
  id: string;
  userId: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionPayload {
  userId: number;
}

export interface JwtPayload {
  id: string;
}

@Injectable()
export class SessionService {
  @Inject()
  private readonly _service: CacheService;

  async set(payload: SessionPayload, sessionTime: number): Promise<string> {
    const session: Session = {
      id: `session:${payload.userId}:${Utils.getUUID()}`,
      userId: payload.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this._service.set(session.id, session, sessionTime);

    return session.id;
  }

  async get(id: string): Promise<Session> {
    const session = await this._service.get<Session>(id);

    return session;
  }

  async update(
    id: string,
    payload: SessionPayload,
    sessionTime: number,
  ): Promise<void> {
    await this._service.set(id, payload, sessionTime);
  }

  async delete(id: string | number) {
    let key: string;

    if (typeof id === 'string') {
      key = id;
    } else {
      key = `session:${id}:*`;
    }

    await this._service.del(key);
  }

  public isReady() {
    return this._service.isReady();
  }
}
