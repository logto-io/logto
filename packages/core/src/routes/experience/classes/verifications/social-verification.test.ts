import { ConnectorType, GoogleConnector } from '@logto/connector-kit';
import { VerificationType, type SocialVerificationRecordData } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockConnector } from '#src/__mocks__/connector.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { type Cookies } from '#src/test-utils/jest-koa-mocks/create-mock-cookies.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const isExternalGoogleOneTapChecker = jest.fn().mockReturnValue(false);

await mockEsmWithActual('@logto/connector-kit', () => ({
  isExternalGoogleOneTap: isExternalGoogleOneTapChecker,
}));

// Mock EnvSet
const mockEnvSetValues = {
  isDevFeaturesEnabled: false,
};

jest.mock('#src/env-set/index.js', () => ({
  EnvSet: {
    values: mockEnvSetValues,
  },
}));

// Mock the imported verifySocialIdentity function
const mockVerifySocialIdentity = jest
  .fn()
  .mockResolvedValue({ id: 'foo', email: 'test@example.com' });
jest.mock('#src/routes/interaction/utils/social-verification.js', () => ({
  verifySocialIdentity: mockVerifySocialIdentity,
}));

const getUserInfo = jest.fn().mockResolvedValue({ id: 'foo', email: 'test@example.com' });
const getUserInfoWithOptionalTokenResponse = jest
  .fn()
  .mockResolvedValue({ userInfo: { id: 'foo', email: 'test@example.com' } });
const getConnector = jest.fn().mockResolvedValue({
  ...mockConnector,
  type: ConnectorType.Social,
  metadata: { ...mockConnector.metadata, target: 'google' },
});

const tenant = new MockTenant(undefined, undefined, undefined, {
  socials: { getUserInfo, getConnector, getUserInfoWithOptionalTokenResponse },
});

// Mock provider for interaction details
const mockProvider = {
  interactionDetails: jest.fn(),
  interactionResult: jest.fn(),
};

const tenantContext = {
  ...tenant,
  provider: mockProvider,
};

const { SocialVerification } = await import('./social-verification.js');

describe('SocialVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isExternalGoogleOneTapChecker.mockReturnValue(false);
  });

  describe('constructor and basic properties', () => {
    it('should create instance with correct properties', () => {
      const verification = new SocialVerification(tenant.libraries, tenant.queries, {
        id: 'test-id',
        connectorId: 'google',
        type: VerificationType.Social,
      } as SocialVerificationRecordData);

      expect(verification.id).toBe('test-id');
      expect(verification.connectorId).toBe('google');
      expect(verification.type).toBe(VerificationType.Social);
      expect(verification.isVerified).toBe(false);
    });

    it('should create instance using factory method', () => {
      const verification = SocialVerification.create(tenant.libraries, tenant.queries, 'google');

      expect(verification.connectorId).toBe('google');
      expect(verification.type).toBe(VerificationType.Social);
      expect(verification.isVerified).toBe(false);
    });
  });

  describe('verify method with legacy implementation', () => {
    beforeEach(() => {
      // Set mock to false to use legacy implementation
      // eslint-disable-next-line @silverhand/fp/no-mutation
      mockEnvSetValues.isDevFeaturesEnabled = false;
    });

    it('should skip CSRF token validation for external website Google One Tap via legacy verify', async () => {
      const verification = new SocialVerification(tenant.libraries, tenant.queries, {
        id: 'test-id',
        connectorId: 'google',
        type: VerificationType.Social,
        connectorSession: { state: 'test-state' },
      } as SocialVerificationRecordData);

      getConnector.mockResolvedValueOnce({
        ...mockConnector,
        type: ConnectorType.Social,
        metadata: { ...mockConnector.metadata, id: GoogleConnector.factoryId, target: 'google' },
      });

      // Mock isExternalGoogleOneTap to return true
      isExternalGoogleOneTapChecker.mockReturnValueOnce(true);

      // @ts-expect-error test mock context
      const ctx: WithLogContext = {
        ...createMockContext(),
        ...createMockLogContext(),
        cookies: {
          get: jest.fn().mockImplementation((key) => {
            // For external Google One Tap, return the credential value for the logto cookie
            if (key === '_logto_google_one_tap_credential') {
              return 'credential';
            }
            return 'different_token';
          }),
          set: jest.fn(),
        } as unknown as Cookies,
      };

      const connectorData = {
        [GoogleConnector.oneTapParams.credential]: 'credential',
        [GoogleConnector.oneTapParams.csrfToken]: 'mismatched_token',
      };

      // @ts-expect-error test mock tenant context
      await verification.verify(ctx, tenantContext, connectorData, 'verificationRecord');

      expect(verification.socialUserInfo).toEqual({ id: 'foo', email: 'test@example.com' });
      expect(isExternalGoogleOneTapChecker).toHaveBeenCalledWith(connectorData);
    });

    it('should enforce CSRF token validation for regular Google One Tap via legacy verify', async () => {
      const verification = new SocialVerification(tenant.libraries, tenant.queries, {
        id: 'test-id',
        connectorId: 'google',
        type: VerificationType.Social,
        connectorSession: { state: 'test-state' },
      } as SocialVerificationRecordData);

      getConnector.mockResolvedValueOnce({
        ...mockConnector,
        type: ConnectorType.Social,
        metadata: { ...mockConnector.metadata, id: GoogleConnector.factoryId, target: 'google' },
      });

      // Mock isExternalGoogleOneTap to return false (regular Google One Tap)
      isExternalGoogleOneTapChecker.mockReturnValueOnce(false);

      // @ts-expect-error test mock context
      const ctx: WithLogContext = {
        ...createMockContext(),
        ...createMockLogContext(),
        cookies: {
          get: jest.fn().mockReturnValue('different_token'),
          set: jest.fn(),
        } as unknown as Cookies,
      };

      const connectorData = {
        [GoogleConnector.oneTapParams.credential]: 'credential',
        [GoogleConnector.oneTapParams.csrfToken]: 'mismatched_token',
      };

      await expect(
        // @ts-expect-error test mock tenant context
        verification.verify(ctx, tenantContext, connectorData, 'verificationRecord')
      ).rejects.toThrow('CSRF token mismatch.');

      expect(isExternalGoogleOneTapChecker).toHaveBeenCalledWith(connectorData);
    });
  });

  describe('verifySocialIdentity (dev features enabled)', () => {
    beforeEach(() => {
      // Set mock to true to enable dev features
      // eslint-disable-next-line @silverhand/fp/no-mutation
      mockEnvSetValues.isDevFeaturesEnabled = true;
    });

    it('should skip CSRF token validation for external website Google One Tap with interactionSession', async () => {
      const verification = new SocialVerification(tenant.libraries, tenant.queries, {
        id: 'test-id',
        connectorId: 'google',
        type: VerificationType.Social,
      } as SocialVerificationRecordData);

      getConnector.mockResolvedValueOnce({
        ...mockConnector,
        type: ConnectorType.Social,
        metadata: { ...mockConnector.metadata, id: GoogleConnector.factoryId, target: 'google' },
      });

      // Mock isExternalGoogleOneTap to return true
      isExternalGoogleOneTapChecker.mockReturnValueOnce(true);

      // @ts-expect-error test mock context
      const ctx: WithLogContext = {
        ...createMockContext(),
        ...createMockLogContext(),
        cookies: {
          get: jest.fn().mockImplementation((key) => {
            // For external Google One Tap, return the credential value for the logto cookie
            if (key === '_logto_google_one_tap_credential') {
              return 'external_credential';
            }
            return 'different_token';
          }),
          set: jest.fn(),
        } as unknown as Cookies,
      };

      const connectorData = {
        [GoogleConnector.oneTapParams.credential]: 'external_credential',
      };

      await verification.verify(
        ctx,
        // @ts-expect-error test mock tenant context
        tenantContext,
        connectorData,
        'interactionSession'
      );

      expect(verification.socialUserInfo).toEqual({ id: 'foo', email: 'test@example.com' });
      expect(isExternalGoogleOneTapChecker).toHaveBeenCalledWith(connectorData);
      expect(getUserInfoWithOptionalTokenResponse).toHaveBeenCalledWith(
        'google',
        connectorData,
        expect.any(Function)
      );
    });

    it('should enforce CSRF token validation for regular Google One Tap with verificationRecord', async () => {
      const verification = new SocialVerification(tenant.libraries, tenant.queries, {
        id: 'test-id',
        connectorId: 'google',
        type: VerificationType.Social,
        connectorSession: { state: 'test-state' },
      } as SocialVerificationRecordData);

      getConnector.mockResolvedValueOnce({
        ...mockConnector,
        type: ConnectorType.Social,
        metadata: { ...mockConnector.metadata, id: GoogleConnector.factoryId, target: 'google' },
      });

      // Mock isExternalGoogleOneTap to return false (regular Google One Tap)
      isExternalGoogleOneTapChecker.mockReturnValueOnce(false);

      // @ts-expect-error test mock context
      const ctx: WithLogContext = {
        ...createMockContext(),
        ...createMockLogContext(),
        cookies: {
          get: jest.fn().mockReturnValue('different_token'),
          set: jest.fn(),
        } as unknown as Cookies,
      };

      const connectorData = {
        [GoogleConnector.oneTapParams.credential]: 'credential',
        [GoogleConnector.oneTapParams.csrfToken]: 'mismatched_token',
      };

      await expect(
        // @ts-expect-error test mock tenant context
        verification.verify(ctx, tenantContext, connectorData, 'verificationRecord')
      ).rejects.toThrow(RequestError);

      expect(isExternalGoogleOneTapChecker).toHaveBeenCalledWith(connectorData);
    });

    it('should work with matching CSRF token for regular Google One Tap', async () => {
      const verification = new SocialVerification(tenant.libraries, tenant.queries, {
        id: 'test-id',
        connectorId: 'google',
        type: VerificationType.Social,
        connectorSession: { state: 'test-state' },
      } as SocialVerificationRecordData);

      getConnector.mockResolvedValueOnce({
        ...mockConnector,
        type: ConnectorType.Social,
        metadata: { ...mockConnector.metadata, id: GoogleConnector.factoryId, target: 'google' },
      });

      // Mock isExternalGoogleOneTap to return false (regular Google One Tap)
      isExternalGoogleOneTapChecker.mockReturnValueOnce(false);

      // @ts-expect-error test mock context
      const ctx: WithLogContext = {
        ...createMockContext(),
        ...createMockLogContext(),
        cookies: {
          get: jest.fn().mockReturnValue('matching_token'),
          set: jest.fn(),
        } as unknown as Cookies,
      };

      const connectorData = {
        [GoogleConnector.oneTapParams.credential]: 'credential',
        [GoogleConnector.oneTapParams.csrfToken]: 'matching_token',
      };

      // @ts-expect-error test mock tenant context
      await verification.verify(ctx, tenantContext, connectorData, 'verificationRecord');

      expect(verification.socialUserInfo).toEqual({ id: 'foo', email: 'test@example.com' });
      expect(isExternalGoogleOneTapChecker).toHaveBeenCalledWith(connectorData);
      expect(getUserInfoWithOptionalTokenResponse).toHaveBeenCalledWith(
        'google',
        connectorData,
        expect.any(Function)
      );
    });
  });
});
