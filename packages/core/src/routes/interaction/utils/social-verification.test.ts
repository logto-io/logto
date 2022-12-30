import { ConnectorType } from '@logto/connector-kit';
import { createMockUtils } from '@logto/shared/esm';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

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

describe('social-verification', () => {
  it('verifySocialIdentity', async () => {
    const provider = createMockProvider();
    // @ts-expect-error test mock context
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const ctx = { ...createMockContext(), ...createMockLogContext() } as WithLogContext;
    const connectorId = 'connector';
    const connectorData = { authCode: 'code' };
    const userInfo = await verifySocialIdentity({ connectorId, connectorData }, ctx, provider);

    expect(getUserInfoByAuthCode).toBeCalledWith(connectorId, connectorData, expect.anything());
    expect(userInfo).toEqual({ id: 'foo' });
  });
});
