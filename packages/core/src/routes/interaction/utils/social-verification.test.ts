import { ConnectorType, GoogleConnector } from '@logto/connector-kit';
import { createMockUtils } from '@logto/shared/esm';

import { mockConnector } from '#src/__mocks__/connector.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

const isExternalGoogleOneTap = jest.fn().mockReturnValue(false);

await mockEsmWithActual('@logto/connector-kit', () => ({
  isExternalGoogleOneTap,
}));

const getUserInfo = jest.fn().mockResolvedValue({ id: 'foo' });
const getConnector = jest.fn().mockResolvedValue(mockConnector);

const tenant = new MockTenant(undefined, undefined, undefined, {
  socials: { getUserInfo, getConnector },
});

mockEsm('#src/libraries/connector.js', () => ({
  getLogtoConnectorById: jest.fn().mockResolvedValue({
    metadata: {
      id: 'social',
    },
    type: ConnectorType.Social,
    getAuthorizationUri: jest.fn(async () => ''),
  }),
}));

const { verifySocialIdentity } = await import('./social-verification.js');

describe('verifySocialIdentity', () => {
  it('should verify social identity', async () => {
    // @ts-expect-error test mock context
    const ctx: WithLogContext = {
      ...createMockContext(),
      ...createMockLogContext(),
    };
    const connectorId = 'connector';
    const connectorData = { authCode: 'code' };
    const userInfo = await verifySocialIdentity({ connectorId, connectorData }, ctx, tenant);

    expect(getUserInfo).toBeCalledWith(connectorId, connectorData, expect.anything());
    expect(userInfo).toEqual({ id: 'foo' });
  });

  it('should throw error if csrf token is not matched for Google One Tap verification', async () => {
    const ctx: WithLogContext = {
      ...createMockContext(),
      ...createMockLogContext(),
      // @ts-expect-error test mock context
      cookies: { get: jest.fn().mockReturnValue('token') },
    };

    getConnector.mockResolvedValueOnce({
      ...mockConnector,
      metadata: {
        ...mockConnector.metadata,
        id: GoogleConnector.factoryId,
      },
    });
    const connectorData = {
      [GoogleConnector.oneTapParams.credential]: 'credential',
      [GoogleConnector.oneTapParams.csrfToken]: 'mismatched_token',
    };

    await expect(
      verifySocialIdentity({ connectorId: 'google', connectorData }, ctx, tenant)
    ).rejects.toThrow('CSRF token mismatch.');
  });

  it('should verify Google One Tap verification', async () => {
    const ctx: WithLogContext = {
      ...createMockContext(),
      ...createMockLogContext(),
      // @ts-expect-error test mock context
      cookies: { get: jest.fn().mockReturnValue('token') },
    };
    const connectorId = GoogleConnector.factoryId;
    const connectorData = {
      [GoogleConnector.oneTapParams.credential]: 'credential',
      [GoogleConnector.oneTapParams.csrfToken]: 'token',
    };

    await expect(
      verifySocialIdentity({ connectorId, connectorData }, ctx, tenant)
    ).resolves.toEqual({ id: 'foo' });
  });

  it('should skip CSRF token validation for external website Google One Tap', async () => {
    const ctx: WithLogContext = {
      ...createMockContext(),
      ...createMockLogContext(),
      // @ts-expect-error test mock context
      cookies: {
        get: jest.fn().mockImplementation((key) => {
          // For external Google One Tap, return the credential value for the logto cookie
          if (key === '_logto_google_one_tap_credential') {
            return 'credential';
          }
          return 'different_token';
        }),
      },
    };

    getConnector.mockResolvedValueOnce({
      ...mockConnector,
      metadata: {
        ...mockConnector.metadata,
        id: GoogleConnector.factoryId,
      },
    });

    // Mock isExternalGoogleOneTap to return true
    isExternalGoogleOneTap.mockReturnValueOnce(true);

    const connectorData = {
      [GoogleConnector.oneTapParams.credential]: 'credential',
      [GoogleConnector.oneTapParams.csrfToken]: 'mismatched_token',
    };

    // Should not throw CSRF mismatch error for external website Google One Tap
    await expect(
      verifySocialIdentity({ connectorId: 'google', connectorData }, ctx, tenant)
    ).resolves.toEqual({ id: 'foo' });

    expect(isExternalGoogleOneTap).toHaveBeenCalledWith(connectorData);
  });

  it('should enforce CSRF token validation for regular Google One Tap', async () => {
    const ctx: WithLogContext = {
      ...createMockContext(),
      ...createMockLogContext(),
      // @ts-expect-error test mock context
      cookies: { get: jest.fn().mockReturnValue('different_token') },
    };

    getConnector.mockResolvedValueOnce({
      ...mockConnector,
      metadata: {
        ...mockConnector.metadata,
        id: GoogleConnector.factoryId,
      },
    });

    // Mock isExternalGoogleOneTap to return false (regular Google One Tap)
    isExternalGoogleOneTap.mockReturnValueOnce(false);

    const connectorData = {
      [GoogleConnector.oneTapParams.credential]: 'credential',
      [GoogleConnector.oneTapParams.csrfToken]: 'mismatched_token',
    };

    // Should throw CSRF mismatch error for regular Google One Tap
    await expect(
      verifySocialIdentity({ connectorId: 'google', connectorData }, ctx, tenant)
    ).rejects.toThrow('CSRF token mismatch.');

    expect(isExternalGoogleOneTap).toHaveBeenCalledWith(connectorData);
  });
});
