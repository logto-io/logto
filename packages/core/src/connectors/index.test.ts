import { ConnectorType } from '@logto/schemas';
import { NotFoundError } from 'slonik';

import {
  getConnectorInstanceById,
  getConnectorInstances,
  getEnabledConnectorInstanceByType,
  getSocialConnectorInstanceById,
  initConnectors,
} from '@/connectors/index';
import RequestError from '@/errors/RequestError';

const aliyunDmConnector = {
  id: 'aliyun-dm',
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_911,
};

const aliyunSmsConnector = {
  id: 'aliyun-sms',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_666,
};

const githubConnector = {
  id: 'github',
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_123,
};

const googleConnector = {
  id: 'google',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};

const findConnectorById = jest.fn(async (id: string) => ({ id }));
const hasConnector = jest.fn(async (id: string) => id === 'aliyun-dm');
const insertConnector = jest.fn(async () => ({}));

jest.mock('@/queries/connector', () => ({
  ...jest.requireActual('@/queries/connector'),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findConnectorsByIds: async (ids: string[]) => [
    aliyunDmConnector,
    aliyunSmsConnector,
    githubConnector,
    googleConnector,
  ],
  findConnectorById: async (id: string) => findConnectorById(id),
  hasConnector: async (id: string) => hasConnector(id),
  insertConnector: async () => insertConnector(),
}));

describe('getConnectorInstances', () => {
  test('should return the connectors existing in DB', async () => {
    const connectorInstances = await getConnectorInstances();
    expect(connectorInstances).toHaveLength(4);
    expect(connectorInstances[0]).toHaveProperty('connector', aliyunDmConnector);
    expect(connectorInstances[1]).toHaveProperty('connector', aliyunSmsConnector);
    expect(connectorInstances[2]).toHaveProperty('connector', githubConnector);
    expect(connectorInstances[3]).toHaveProperty('connector', googleConnector);
  });
});

describe('getConnectorInstanceById', () => {
  test('should return the connector existing in DB', async () => {
    findConnectorById.mockImplementationOnce(async () => aliyunDmConnector);
    const connectorInstance = await getConnectorInstanceById('aliyun-dm');
    expect(connectorInstance).toHaveProperty('connector', aliyunDmConnector);
  });

  test('should throw on invalid id', async () => {
    const id = 'invalid_id';
    await expect(getConnectorInstanceById(id)).rejects.toMatchError(
      new RequestError({ code: 'entity.not_found', id, status: 404 })
    );
  });

  test('should throw on non-existing connector in DB', async () => {
    findConnectorById.mockImplementationOnce(async () => {
      throw new NotFoundError();
    });
    await expect(getConnectorInstanceById('facebook')).rejects.toMatchError(new NotFoundError());
  });
});

describe('getSocialConnectorInstanceById', () => {
  test('should return the connector existing in DB', async () => {
    findConnectorById.mockImplementationOnce(async () => googleConnector);
    const socialConnectorInstance = await getSocialConnectorInstanceById('google');
    expect(socialConnectorInstance).toHaveProperty('connector', googleConnector);
  });

  test('should throw on invalid id', async () => {
    const id = 'invalid_id';
    await expect(getSocialConnectorInstanceById(id)).rejects.toMatchError(
      new RequestError({ code: 'entity.not_found', id, status: 404 })
    );
  });

  test('should throw on non-existing connector in DB', async () => {
    findConnectorById.mockImplementationOnce(async () => {
      throw new NotFoundError();
    });
    await expect(getConnectorInstanceById('facebook')).rejects.toMatchError(new NotFoundError());
  });
});

describe('getEnabledConnectorInstanceByType', () => {
  test('should return the enabled connector existing in DB', async () => {
    const dmEnabledConnectorInstance = await getEnabledConnectorInstanceByType(ConnectorType.Email);
    expect(dmEnabledConnectorInstance).toHaveProperty('connector', aliyunDmConnector);
  });

  test('should throw when there is no enabled connector existing in DB', async () => {
    const type = ConnectorType.SMS;
    await expect(getEnabledConnectorInstanceByType(type)).rejects.toMatchError(
      new RequestError('connector.not_found', { type })
    );
  });
});

describe('initConnectors', () => {
  test('should call hasConnector and insertConnector', async () => {
    hasConnector.mockClear();
    insertConnector.mockClear();
    await expect(initConnectors()).resolves.not.toThrow();
    expect(hasConnector).toHaveBeenCalled();
    expect(insertConnector).toHaveBeenCalled();
  });
});
