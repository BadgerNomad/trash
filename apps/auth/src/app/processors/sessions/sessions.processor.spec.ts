import { config } from 'dotenv';
config();

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { expect } from '@jest/globals';
import '@jest-custom/entity-compare.matcher';

import authConfig from '@auth/config/auth';

import Utils from '@libs/utils/utils';

import {
  SessionPayload,
  SessionService,
} from '@auth/caches/sessions/session.service';

import DatabaseModule from '@auth/database/database.module';

import AuthTokenService from '@auth/auth/token_service/auth.token.service';

import SessionsProcessor from './sessions.processor';
import SessionsProcessorModule from './sessions.processor.module';

jest.mock('@auth/database/database.module');

class SessionsProcessorTest {
  private _app: INestApplication;

  // Services

  private _processor: SessionsProcessor;
  private _sessionService: SessionService;
  private _authTokenService: AuthTokenService;

  run(): void {
    beforeAll(async () => {
      // Create application

      const testingModule = await Test.createTestingModule({
        imports: [DatabaseModule.forRoot(), SessionsProcessorModule],
      }).compile();
      this._app = testingModule.createNestApplication();

      await this._app.init();

      // Services

      this._processor = this._app.get(SessionsProcessor);
      this._sessionService = this._app.get(SessionService);
      this._authTokenService = this._app.get(AuthTokenService);
    });

    afterAll(async () => {
      await this._app.close();
    });

    beforeEach(async () => {
      jest.restoreAllMocks();
    });

    describe('Sessions processor', () => {
      describe('Create', () => {
        this.create();
      });

      describe('Drop all', () => {
        this.dropAll();
      });
    });
  }

  create() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock payload

      const payload: SessionPayload = {
        userId: Utils.randomInt(),
      };

      const sessionId = Utils.getUUID();

      // Mock session service

      const set = jest
        .spyOn(this._sessionService, 'set')
        .mockImplementation(async () => {
          return sessionId;
        });

      // Mock auth token

      const jwt = {
        accessToken: Utils.getUUID(),
        refreshToken: Utils.getUUID(),
      };

      const createTokens = jest
        .spyOn(this._authTokenService, 'createTokens')
        .mockImplementation(() => {
          return jwt;
        });

      const response = await this._processor.create(payload);

      // Checkout mocks called

      expect(set).toBeCalled();
      expect(set).lastCalledWith(payload, authConfig.jwt.refresh.lifetime);

      expect(createTokens).toBeCalled();
      expect(createTokens).lastCalledWith(sessionId);

      // Checkout response

      expect(response).toEqual(jwt);
    });
  }

  dropAll() {
    const info = 'Simple request';

    it(info, async () => {
      // Mock payload

      const user_id = Utils.randomInt();

      const del = jest
        .spyOn(this._sessionService, 'delete')
        .mockImplementation();

      await this._processor.dropAll(user_id);

      // Checkout session service called

      expect(del).toBeCalled();
      expect(del).lastCalledWith(user_id);
    });
  }
}

const test = new SessionsProcessorTest();
test.run();
