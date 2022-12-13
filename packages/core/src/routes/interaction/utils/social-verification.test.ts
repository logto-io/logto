import { ConnectorType } from '@logto/connector-kit';
import { mockEsm } from '@logto/shared/esm';

const { jest } = import.meta;

const { getUserInfoByAuthCode } = mockEsm('#src/lib/social.js', () => ({
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
const log = jest.fn();

describe('social-verification', () => {
  it('verifySocialIdentity', async () => {
    const connectorId = 'connector';
    const connectorData = { authCode: 'code' };
    const userInfo = await verifySocialIdentity({ connectorId, connectorData }, log);

    expect(getUserInfoByAuthCode).toBeCalledWith(connectorId, connectorData);
    expect(userInfo).toEqual({ id: 'foo' });
  });
});
