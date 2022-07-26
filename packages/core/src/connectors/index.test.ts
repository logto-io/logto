import { ConnectorPlatform } from '@logto/connector-types';
import { Connector } from '@logto/schemas';

import {
  getConnectorInstanceById,
  getConnectorInstances,
  getSocialConnectorInstanceById,
  initConnectors,
} from '@/connectors/index';
import RequestError from '@/errors/RequestError';

const alipayConnector = {
  id: 'alipay-web',
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_911,
};
const alipayNativeConnector = {
  id: 'alipay-native',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_911,
};
const aliyunDmConnector = {
  id: 'aliyun-direct-mail',
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_911,
};
const aliyunSmsConnector = {
  id: 'aliyun-short-message-service',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_666,
};
const appleConnector = {
  id: 'apple-universal',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_666,
};
const facebookConnector = {
  id: 'facebook-universal',
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_333,
};
const githubConnector = {
  id: 'github-universal',
  enabled: true,
  config: {},
  createdAt: 1_646_382_233_555,
};
const googleConnector = {
  id: 'google-universal',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};
const azureADConnector = {
  id: 'azuread-universal',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};
const sendGridMailConnector = {
  id: 'sendgrid-email-service',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_111,
};
const smtpConnector = {
  id: 'simple-mail-transfer-protocol',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_111,
};
const twilioSmsConnector = {
  id: 'twilio-short-message-service',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};
const wechatConnector = {
  id: 'wechat-web',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};
const wechatNativeConnector = {
  id: 'wechat-native',
  enabled: false,
  config: {},
  createdAt: 1_646_382_233_000,
};

const connectors = [
  alipayConnector,
  alipayNativeConnector,
  aliyunDmConnector,
  aliyunSmsConnector,
  appleConnector,
  facebookConnector,
  githubConnector,
  googleConnector,
  azureADConnector,
  sendGridMailConnector,
  smtpConnector,
  twilioSmsConnector,
  wechatConnector,
  wechatNativeConnector,
];

const findAllConnectors = jest.fn(async () => connectors);
const insertConnector = jest.fn(async (connector: Connector) => connector);

jest.mock('@/queries/connector', () => ({
  ...jest.requireActual('@/queries/connector'),
  findAllConnectors: async () => findAllConnectors(),
  insertConnector: async (connector: Connector) => insertConnector(connector),
}));

describe('getConnectorInstances', () => {
  test('should return the connectors existing in DB', async () => {
    const connectorInstances = await getConnectorInstances();
    expect(connectorInstances).toHaveLength(connectors.length);

    for (const [index, connector] of connectors.entries()) {
      expect(connectorInstances[index]).toHaveProperty('connector', connector);
    }
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
    expect(findAllConnectors).toHaveBeenCalled();
  });

  afterEach(() => {
    findAllConnectors.mockClear();
  });
});

describe('getConnectorInstanceById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return the connector existing in DB', async () => {
    const connectorInstance = await getConnectorInstanceById('aliyun-direct-mail');
    expect(connectorInstance).toHaveProperty('connector', aliyunDmConnector);
  });

  test('should throw on invalid id (on DB query)', async () => {
    const id = 'invalid_id';
    await expect(getConnectorInstanceById(id)).rejects.toThrow();
  });

  test('should throw on invalid id (on finding metadata)', async () => {
    const id = 'invalid_id';
    await expect(getConnectorInstanceById(id)).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_found',
        target: 'invalid_target',
        platfrom: ConnectorPlatform.Web,
        status: 404,
      })
    );
  });
});

describe('getSocialConnectorInstanceById', () => {
  test('should return the connector existing in DB', async () => {
    const socialConnectorInstance = await getSocialConnectorInstanceById('google-universal');
    expect(socialConnectorInstance).toHaveProperty('connector', googleConnector);
  });

  test('should throw on non-social connector', async () => {
    const id = 'aliyun-direct-mail';
    await expect(getSocialConnectorInstanceById(id)).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_found',
        id,
        status: 404,
      })
    );
  });
});

describe('initConnectors', () => {
  test('should insert the necessary connector if it does not exist in DB', async () => {
    findAllConnectors.mockImplementationOnce(async () => []);
    await expect(initConnectors()).resolves.not.toThrow();
    expect(insertConnector).toHaveBeenCalledTimes(connectors.length);

    for (const [i, connector] of connectors.entries()) {
      const { id } = connector;
      expect(insertConnector).toHaveBeenNthCalledWith(
        i + 1,
        expect.objectContaining({
          id,
        })
      );
    }
  });

  test('should not insert the connector if it exists in DB', async () => {
    await expect(initConnectors()).resolves.not.toThrow();
    expect(insertConnector).not.toHaveBeenCalled();
  });

  afterEach(() => {
    findAllConnectors.mockClear();
    insertConnector.mockClear();
  });
});
