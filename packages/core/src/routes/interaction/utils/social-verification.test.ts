import { ConnectorType } from '@logto/connector-kit';

import { getUserInfoByAuthCode } from '#src/lib/social.js';

import { verifySocialIdentity } from './social-verification.js';

jest.mock('#src/lib/social.js', () => ({
  getUserInfoByAuthCode: jest.fn().mockResolvedValue({ id: 'foo' }),
}));

jest.mock('#src/connectors.js', () => ({
  getLogtoConnectorById: jest.fn().mockResolvedValue({
    metadata: {
      id: 'social',
    },
    type: ConnectorType.Social,
    getAuthorizationUri: jest.fn(async () => ''),
  }),
}));

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
