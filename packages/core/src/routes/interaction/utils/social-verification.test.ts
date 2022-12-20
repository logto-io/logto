import { ConnectorType } from '@logto/connector-kit';
import { mockEsm } from '@logto/shared/esm';

import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';

const { jest } = import.meta;

const { getUserInfoByAuthCode } = mockEsm('#src/libraries/social.js', () => ({
  getUserInfoByAuthCode: jest.fn().mockResolvedValue({ id: 'foo' }),
}));

mockEsm('#src/connectors.js', () => ({
  getLogtoConnectorById: jest.fn().mockResolvedValue({
    metadata: {
      id: 'social',
    },
    type: ConnectorType.Social,
    getAuthorizationUri: jest.fn(async () => ''),
  }),
}));

const { verifySocialIdentity } = await import('./social-verification.js');
const log = createMockLogContext();

describe('social-verification', () => {
  it('verifySocialIdentity', async () => {
    const getSession = jest.fn();
    const connectorId = 'connector';
    const connectorData = { authCode: 'code' };
    const userInfo = await verifySocialIdentity(
      { connectorId, connectorData },
      log.createLog,
      getSession
    );

    expect(getUserInfoByAuthCode).toBeCalledWith(connectorId, connectorData, getSession);
    expect(userInfo).toEqual({ id: 'foo' });
  });
});
