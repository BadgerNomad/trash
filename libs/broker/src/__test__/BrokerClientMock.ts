import BrokerClient from '../broker.client';

export interface IBrokerClientMock {
  handlers: IHandlers;
  send: jest.SpyInstance;
  close: jest.SpyInstance;
  subscribe: jest.SpyInstance;
  trigger: (queue: string, message: any) => Promise<void>;
}

interface IHandlers {
  [queue: string]: {
    instance: any;
    handler: string;
  };
}

export default (): IBrokerClientMock => {
  const handlers: IHandlers = {};

  const BrokerClientMock = jest.mocked(BrokerClient, true);

  const sendMock = jest.fn((queue: string, msg: any) => void 0);
  const closeMock = jest.fn((...args) => void 0);
  const subscribeMock = jest.fn(
    (queue: string, instance: unknown, handler: string) => {
      handlers[queue] = {
        instance,
        handler,
      };
    },
  );

  const trigger = async (queue: string, message: any) => {
    const endpoint = handlers[queue];
    await endpoint.instance[endpoint.handler](message);
  };

  BrokerClientMock.mockImplementation((): any => {
    return {
      subscribe: subscribeMock,
      close: closeMock,
      send: sendMock,
    };
  });

  return {
    handlers,
    send: sendMock,
    close: closeMock,
    subscribe: subscribeMock,
    trigger,
  };
};
