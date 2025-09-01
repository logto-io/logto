import { MfaFactor, VerificationType } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockUser, mockUserWebAuthnMfaVerification } from '#src/__mocks__/user.js';
import { mockWebAuthnVerificationPayload } from '#src/__mocks__/webauthn.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

// Mock the underlying @simplewebauthn/server to return successful verification
await mockEsmWithActual('@simplewebauthn/server', () => ({
  generateRegistrationOptions: jest.fn().mockResolvedValue({ challenge: 'challenge' }),
  verifyRegistrationResponse: jest.fn().mockResolvedValue({
    verified: true,
    registrationInfo: {
      credentialID: 'credentialId',
      credentialPublicKey: 'publicKey',
      counter: 0,
    },
  }),
  generateAuthenticationOptions: jest
    .fn()
    .mockResolvedValue({ challenge: 'auth-challenge', allowCredentials: [] }),
  verifyAuthenticationResponse: jest
    .fn()
    .mockResolvedValue({ verified: true, authenticationInfo: { newCounter: 2 } }),
}));

// Make isoBase64URL.fromBuffer passthrough for simple assertions
await mockEsmWithActual('@simplewebauthn/server/helpers', () => ({
  isoBase64URL: { fromBuffer: jest.fn((value) => value), toBuffer: jest.fn((value) => value) },
}));

const { WebAuthnVerification } = await import('./web-authn-verification.js');

describe('WebAuthnVerification', () => {
  const userId = 'user-id';
  const rpId = 'example.com';

  const findUserById = jest.fn().mockResolvedValue(mockUser);
  const updateUserById = jest.fn();
  const findDefaultAccountCenter = jest
    .fn()
    .mockResolvedValue({ webauthnRelatedOrigins: [] as string[] });

  const tenant = new MockTenant(undefined, {
    users: { findUserById, updateUserById },
    accountCenters: { findDefaultAccountCenter },
  });

  const baseCtx: WithLogContext = {
    ...createContextWithRouteParameters({
      url: 'https://example.com/path',
      encrypted: true,
      host: rpId,
    }),
    ...createMockLogContext(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyWebAuthnRegistration', () => {
    it('should throw when registrationRpId is missing', async () => {
      const verification = new WebAuthnVerification(tenant.libraries, tenant.queries, {
        id: 'v-id',
        userId,
        type: VerificationType.WebAuthn,
        verified: false,
        registrationChallenge: 'challenge-only',
      });

      await expect(
        verification.verifyWebAuthnRegistration(baseCtx, {
          id: 'id',
          rawId: 'id',
          response: { clientDataJSON: 'a', attestationObject: 'b' },
          clientExtensionResults: {},
        })
      ).rejects.toEqual(new RequestError('session.mfa.pending_info_not_found'));
    });

    it('should verify and produce BindWebAuthn with rpId', async () => {
      const verification = new WebAuthnVerification(tenant.libraries, tenant.queries, {
        id: 'v-id',
        userId,
        type: VerificationType.WebAuthn,
        verified: false,
        registrationChallenge: 'challenge',
        registrationRpId: rpId,
      });

      const ctx: WithLogContext = {
        ...createContextWithRouteParameters({
          url: 'https://example.com/any',
          encrypted: true,
          host: rpId,
          headers: { 'user-agent': 'agent-x' },
        }),
        ...createMockLogContext(),
      } as unknown as WithLogContext;

      await verification.verifyWebAuthnRegistration(ctx, {
        id: 'id',
        rawId: 'id',
        response: { clientDataJSON: 'a', attestationObject: 'b' },
        clientExtensionResults: {},
      });

      expect(verification.isVerified).toBe(true);
      expect(verification.toBindMfa()).toMatchObject({
        type: MfaFactor.WebAuthn,
        rpId,
        credentialId: 'credentialId',
        counter: 0,
        agent: 'agent-x',
      });
    });
  });

  describe('verifyWebAuthnAuthentication', () => {
    it('should backfill rpId', async () => {
      // User with an existing WebAuthn MFA missing rpId
      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      });

      const verification = new WebAuthnVerification(tenant.libraries, tenant.queries, {
        id: 'v-id',
        userId,
        type: VerificationType.WebAuthn,
        verified: false,
        authenticationChallenge: 'auth-challenge',
      });

      await verification.verifyWebAuthnAuthentication(baseCtx, {
        ...mockWebAuthnVerificationPayload,
        id: mockUserWebAuthnMfaVerification.credentialId,
      });

      // Persisted backfill: rpId set to hostname and counter updated
      expect(updateUserById).toHaveBeenCalledWith(userId, {
        mfaVerifications: [
          expect.objectContaining({
            id: mockUserWebAuthnMfaVerification.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            rpId: expect.any(String),
            counter: 2,
            type: MfaFactor.WebAuthn,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            lastUsedAt: expect.any(String),
          }),
        ],
      });
    });
  });
});
