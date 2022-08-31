import { ConnectorPlatform } from '@logto/connector-core';
import { Connector } from '@logto/schemas';

import { getLogtoConnectorById, getLogtoConnectors, initConnectors } from '@/connectors';
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
const kakaoConnector = {
  id: 'kakao-universal',
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
  kakaoConnector,
];

const findAllConnectors = jest.fn(async () => connectors);
const insertConnector = jest.fn(async (connector: Connector) => connector);

jest.mock('@/queries/connector', () => ({
  ...jest.requireActual('@/queries/connector'),
  findAllConnectors: async () => findAllConnectors(),
  insertConnector: async (connector: Connector) => insertConnector(connector),
}));

describe('getLogtoConnectors', () => {
  test('should return the connectors existing in DB', async () => {
    const logtoConnectors = await getLogtoConnectors();
    expect(logtoConnectors).toHaveLength(connectors.length);

    for (const [index, connector] of connectors.entries()) {
      expect(logtoConnectors[index]).toHaveProperty('dbEntry', connector);
    }
  });

  test('should throw if any required connector does not exist in DB', async () => {
    const id = 'aliyun-dm';
    findAllConnectors.mockImplementationOnce(async () => []);
    await expect(getLogtoConnectors()).rejects.toMatchError(
      new RequestError({ code: 'entity.not_found', id, status: 404 })
    );
  });

  test('should access DB only once and should not throw', async () => {
    await expect(getLogtoConnectors()).resolves.not.toThrow();
    expect(findAllConnectors).toHaveBeenCalled();
  });

  afterEach(() => {
    findAllConnectors.mockClear();
  });
});

describe('getLogtoConnectorBy', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return the connector existing in DB', async () => {
    const connector = await getLogtoConnectorById('github-universal');
    expect(connector).toHaveProperty('dbEntry', githubConnector);
  });

  test('should throw on invalid id (on DB query)', async () => {
    const id = 'invalid_id';
    await expect(getLogtoConnectorById(id)).rejects.toThrow();
  });

  test('should throw on invalid id (on finding metadata)', async () => {
    const id = 'invalid_id';
    await expect(getLogtoConnectorById(id)).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_found',
        target: 'invalid_target',
        platfrom: ConnectorPlatform.Web,
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
