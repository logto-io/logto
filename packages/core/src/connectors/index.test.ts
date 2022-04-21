import { Connector, ConnectorType } from '@logto/schemas';
import { NotFoundError } from 'slonik';

import {
  getConnectorInstanceById,
  getConnectorInstanceByType,
  getConnectorInstances,
  getEnabledSocialConnectorIds,
  getSocialConnectorInstanceById,
  initConnectors,
} from '@/connectors/index';
import RequestError from '@/errors/RequestError';

const alipayConnector = {
  id: 'alipay',
  type: ConnectorType.Social,
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_911,
};
const aliyunDmConnector = {
  id: 'aliyun-dm',
  type: ConnectorType.Email,
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_911,
};
const aliyunSmsConnector = {
  id: 'aliyun-sms',
  type: ConnectorType.SMS,
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_666,
};
const facebookConnector = {
  id: 'facebook',
  type: ConnectorType.Social,
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_333,
};
const githubConnector = {
  id: 'github',
  type: ConnectorType.Social,
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_555,
};
const googleConnector = {
  id: 'google',
  type: ConnectorType.Social,
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};
const wechatConnector = {
  id: 'wechat',
  type: ConnectorType.Social,
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};
const wechatNativeConnector = {
  id: 'wechat-native',
  type: ConnectorType.Social,
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};

const connectors = [
  alipayConnector,
  aliyunDmConnector,
  aliyunSmsConnector,
  facebookConnector,
  githubConnector,
  googleConnector,
  wechatConnector,
  wechatNativeConnector,
];
const connectorMap = new Map(connectors.map((connector) => [connector.id, connector]));

const findAllConnectors = jest.fn(async () => connectors);
const findConnectorById = jest.fn(async (id: string) => {
  const connector = connectorMap.get(id);

  if (!connector) {
    throw new NotFoundError();
  }

  return connector;
});
const insertConnector = jest.fn(async (connector: Connector) => connector);

jest.mock('@/queries/connector', () => ({
  ...jest.requireActual('@/queries/connector'),
  findAllConnectors: async () => findAllConnectors(),
  findConnectorById: async (id: string) => findConnectorById(id),
  insertConnector: async (connector: Connector) => insertConnector(connector),
}));

describe('getConnectorInstances', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return the connectors existing in DB', async () => {
    const connectorInstances = await getConnectorInstances();
    expect(connectorInstances).toHaveLength(connectorInstances.length);
    expect(connectorInstances[0]).toHaveProperty('connector', alipayConnector);
    expect(connectorInstances[1]).toHaveProperty('connector', aliyunDmConnector);
    expect(connectorInstances[2]).toHaveProperty('connector', aliyunSmsConnector);
    expect(connectorInstances[3]).toHaveProperty('connector', facebookConnector);
    expect(connectorInstances[4]).toHaveProperty('connector', githubConnector);
    expect(connectorInstances[5]).toHaveProperty('connector', googleConnector);
    expect(connectorInstances[6]).toHaveProperty('connector', wechatConnector);
  });

  test('should throw if any required connector does not exist in DB', async () => {
    const id = 'aliyun-dm';
    findAllConnectors.mockImplementationOnce(async () => []);
    await expect(getConnectorInstances()).rejects.toMatchError(
      new RequestError({ code: 'entity.not_found', id, status: 404 })
    );
  });

  test('should access DB only once and should not throw', async () => {
    await expect(getConnectorInstances()).resolves.not.toThrow();
    expect(findAllConnectors).toHaveBeenCalledTimes(1);
  });
});

describe('getConnectorInstanceById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
  afterEach(() => {
    jest.clearAllMocks();
  });

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

describe('getEnabledSocialConnectorIds', () => {
  test('should return the enabled social connectors existing in DB', async () => {
    const enabledSocialConnectorIds = await getEnabledSocialConnectorIds();
    expect(enabledSocialConnectorIds).toEqual(['alipay', 'facebook', 'github']);
  });
});

describe('getConnectorInstanceByType', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return the enabled connector existing in DB', async () => {
    const dmEnabledConnectorInstance = await getConnectorInstanceByType(ConnectorType.Email);
    expect(dmEnabledConnectorInstance).toHaveProperty('connector', aliyunDmConnector);
  });

  test('should throw when there is no enabled connector existing in DB', async () => {
    const type = ConnectorType.SMS;
    await expect(getConnectorInstanceByType(type)).rejects.toMatchError(
      new RequestError({ code: 'connector.not_found', type })
    );
  });
});

describe('initConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should insert the necessary connector if it does not exist in DB', async () => {
    findAllConnectors.mockImplementationOnce(async () => []);
    await expect(initConnectors()).resolves.not.toThrow();
    expect(insertConnector).toHaveBeenCalledTimes(connectors.length);

    for (const [i, connector] of connectors.entries()) {
      const { id, type } = connector;
      expect(insertConnector).toHaveBeenNthCalledWith(i + 1, { id, type });
    }
  });

  test('should not insert the connector if it exists in DB', async () => {
    await expect(initConnectors()).resolves.not.toThrow();
    expect(insertConnector).not.toHaveBeenCalled();
  });
});
