import { config } from 'dotenv';
config();

import { Test, TestingModule } from '@nestjs/testing';

import Utils from '@libs/utils/utils';
import CacheService from '@libs/cache/cache.service';

import { SessionModule } from './session.module';
import { SessionService, SessionPayload, Session } from './session.service';

interface IDeleteOptions {
  isKeyUserId?: true;
}

class SessionServiceTest {
  private _module: TestingModule;

  private _cacheService: CacheService;
  private _sessionService: SessionService;

  run(): void {
    beforeAll(async () => {
      this._module = await Test.createTestingModule({
        imports: [SessionModule],
      }).compile();

      // Service

      this._cacheService = this._module.get(CacheService);
      this._sessionService = this._module.get(SessionService);
    });

    afterAll(async () => {
      await this._module.close();
    });

    beforeEach(async () => {
      jest.restoreAllMocks();
    });

    describe('Session service ', () => {
      describe('Set', () => {
        this.set();
      });

      describe('Get', () => {
        this.get();
      });

      describe('Update', () => {
        this.update();
      });

      describe('Delete', () => {
        this.delete({});
        this.delete({ isKeyUserId: true });
      });
    });
  }

  set() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock payload

      const payload: SessionPayload = {
        userId: Utils.randomInt(),
      };

      const sessionTime = 100;

      // Mock cache service

      const set = jest
        .spyOn(this._cacheService, 'set')
        .mockImplementation(async () => {
          return;
        });

      const id = await this._sessionService.set(payload, sessionTime);

      const firstOccurrence = id.indexOf(':');
      const lastOccurrence = id.lastIndexOf(':');

      const sessionDir = id.slice(0, firstOccurrence);
      const userDir = id.slice(firstOccurrence + 1, lastOccurrence);

      // Checkout response

      expect(typeof id === 'string').toBeTruthy();

      expect(sessionDir).toBe('session');
      expect(userDir).toBe(payload.userId.toString());

      // Checkout cache service called

      const called = set.mock.calls[0];

      expect(set).toBeCalled();
      expect(called[0]).toBe(id);

      expect(called[1].userId).toBe(payload.userId);

      expect(called[2]).toBe(sessionTime);
    });
  }

  get() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock session

      const session: Session = {
        id: Utils.getUUID(),
        userId: Utils.randomInt(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock cache service

      const get = jest
        .spyOn(this._cacheService, 'get')
        .mockImplementation(async () => {
          return session;
        });

      const response = await this._sessionService.get(session.id);

      // Checkout response

      expect(response).toEqual(session);

      // Checkout cache service called

      expect(get).toBeCalled();
      expect(get).lastCalledWith(session.id);
    });
  }

  update() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock payload

      const id = Utils.getUUID();
      const payload: SessionPayload = {
        userId: Utils.randomInt(),
      };
      const sessionTime = 100;

      const set = jest
        .spyOn(this._cacheService, 'set')
        .mockImplementation(async () => {
          return;
        });

      await this._sessionService.update(id, payload, sessionTime);

      // Checkout cache service called

      expect(set).toBeCalled();
      expect(set).lastCalledWith(id, payload, sessionTime);
    });
  }

  delete(options: IDeleteOptions) {
    let info = 'Simple request';

    if (options.isKeyUserId) {
      info = 'Key is user_id';
    }

    it(info, async () => {
      const id = options.isKeyUserId ? Utils.randomInt() : Utils.getUUID();
      const del = jest.spyOn(this._cacheService, 'del').mockImplementation();

      await this._sessionService.delete(id);

      const modifiedId = options.isKeyUserId ? `session:${id}:*` : id;

      expect(del).toBeCalled();
      expect(del).lastCalledWith(modifiedId);
    });
  }
}

const test = new SessionServiceTest();
test.run();
