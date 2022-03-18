import { Connector, ConnectorType } from '@logto/schemas';
import { NotFoundError } from 'slonik';

import {
  getConnectorInstanceById,
  getConnectorInstanceByType,
  getConnectorInstances,
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
const facebookConnector = {
  id: 'facebook',
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_333,
};
const githubConnector = {
  id: 'github',
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_555,
};
const googleConnector = {
  id: 'google',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};

const connectors = [
  aliyunDmConnector,
  aliyunSmsConnector,
  facebookConnector,
  githubConnector,
  googleConnector,
];
const connectorMap = new Map(connectors.map((connector) => [connector.id, connector]));

const findConnectorById = jest.fn(async (id: string) => {
  const connector = connectorMap.get(id);

  if (!connector) {
    throw new NotFoundError();
  }

  return connector;
});
const hasConnector = jest.fn(async () => true);
const insertConnector = jest.fn(async (connector: Connector) => connector);

jest.mock('@/queries/connector', () => ({
  ...jest.requireActual('@/queries/connector'),
  findConnectorsByIds: async () => connectors,
  findConnectorById: async (id: string) => findConnectorById(id),
  hasConnector: async () => hasConnector(),
  insertConnector: async (connector: Connector) => insertConnector(connector),
}));

describe('getConnectorInstances', () => {
  test('should return the connectors existing in DB', async () => {
    const connectorInstances = await getConnectorInstances();
    expect(connectorInstances).toHaveLength(connectorInstances.length);
    expect(connectorInstances[0]).toHaveProperty('connector', aliyunDmConnector);
    expect(connectorInstances[1]).toHaveProperty('connector', aliyunSmsConnector);
    expect(connectorInstances[2]).toHaveProperty('connector', facebookConnector);
    expect(connectorInstances[3]).toHaveProperty('connector', githubConnector);
    expect(connectorInstances[4]).toHaveProperty('connector', googleConnector);
  });
});

describe('getConnectorInstanceById', () => {
  test('should return the connector existing in DB', async () => {
    const connectorInstance = await getConnectorInstanceById('aliyun-dm');
    expect(connectorInstance).toHaveProperty('connector', aliyunDmConnector);
  });

  test('should throw on invalid id', async () => {
    const id = 'invalid_id';
    await expect(getConnectorInstanceById(id)).rejects.toMatchError(
      new RequestError({ code: 'entity.not_found', id, status: 404 })
    );
  });
});

describe('getSocialConnectorInstanceById', () => {
  test('should return the connector existing in DB', async () => {
    const socialConnectorInstance = await getSocialConnectorInstanceById('google');
    expect(socialConnectorInstance).toHaveProperty('connector', googleConnector);
  });

  test('should throw on invalid id', async () => {
    const id = 'invalid_id';
    await expect(getSocialConnectorInstanceById(id)).rejects.toMatchError(
      new RequestError({ code: 'entity.not_found', id, status: 404 })
    );
  });
});

describe('getConnectorInstanceByType', () => {
  test('should return the enabled connector existing in DB', async () => {
    const dmEnabledConnectorInstance = await getConnectorInstanceByType(ConnectorType.Email);
    expect(dmEnabledConnectorInstance).toHaveProperty('connector', aliyunDmConnector);
  });

  test('should throw when there is no enabled connector existing in DB', async () => {
    const type = ConnectorType.SMS;
    await expect(getConnectorInstanceByType(type)).rejects.toMatchError(
      new RequestError('connector.not_found', { type })
    );
  });
});

describe('initConnectors', () => {
  beforeEach(() => {
    insertConnector.mockClear();
    hasConnector.mockClear();
  });

  afterEach(() => {
    insertConnector.mockClear();
    hasConnector.mockClear();
  });

  test('should insert the necessary connector if it does not exist in DB', async () => {
    await expect(initConnectors()).resolves.not.toThrow();
    expect(hasConnector).toHaveBeenCalledTimes(connectors.length);
    expect(insertConnector).not.toHaveBeenCalled();
  });

  test('should not insert the connector if it exists in DB', async () => {
    hasConnector.mockImplementation(async () => false);

    await expect(initConnectors()).resolves.not.toThrow();
    expect(hasConnector).toHaveBeenCalledTimes(connectors.length);

    for (const [i, connector] of connectors.entries()) {
      const { id } = connector;
      expect(insertConnector).toHaveBeenNthCalledWith(i + 1, { id });
    }
  });
});
