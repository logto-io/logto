import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, MfaFactor, type User } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import {
  mockSignInExperience,
  mockUser,
  mockUserTotpMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const mockValidateTotpSecret = jest.fn();
const mockValidateTotpToken = jest.fn();

await mockEsmWithActual('#src/libraries/verification-helpers/totp-validation.js', () => ({
  validateTotpSecret: mockValidateTotpSecret,
  validateTotpToken: mockValidateTotpToken,
}));

const mockedQueries = {
  users: {
    findUserById: jest.fn(async () => mockUser),
    updateUserById: jest.fn(async (_userId: string, data: Partial<User>) => ({
      ...mockUser,
      ...data,
    })),
  },
  signInExperiences: {
    findDefaultSignInExperience: jest.fn(async () => ({
      ...mockSignInExperience,
      mfa: {
        ...mockSignInExperience.mfa,
        factors: [MfaFactor.TOTP],
      },
    })),
  },
} satisfies Partial2<Queries>;

const { findUserById, updateUserById } = mockedQueries.users;
const { findDefaultSignInExperience } = mockedQueries.signInExperiences;

const accountMfaRoutes = await pickDefault(import('./mfa-verifications.js'));

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

describe('account mfa verification routes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries);
  const accountRequest = createRequester({
    authedRoutes: [
      (router) => {
        router.use(async (ctx, next) => {
          ctx.auth = {
            ...ctx.auth,
            id: mockUser.id,
            identityVerified: true,
            scopes: new Set([UserScope.Identities]),
          };
          ctx.accountCenter = {
            enabled: true,
            fields: {
              mfa: AccountCenterControlValue.Edit,
            },
          };
          ctx.appendDataHookContext = jest.fn();

          return next();
        });
      },
      accountMfaRoutes as never,
    ],
    tenantContext,
  });

  beforeEach(() => {
    mockValidateTotpSecret.mockReturnValue(true);
    mockValidateTotpToken.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after each feature-gate test.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
  });

  describe('PUT /api/my-account/mfa-verifications/totp', () => {
    it('should replace the existing totp verification', async () => {
      const existingTotpVerification = {
        ...mockUserTotpMfaVerification,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastUsedAt: '2024-01-02T00:00:00.000Z',
      };

      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [existingTotpVerification],
      });

      const response = await accountRequest.put('/my-account/mfa-verifications/totp').send({
        secret: 'new_totp_secret',
        code: '123456',
      });

      expect(response.status).toBe(204);
      expect(mockValidateTotpSecret).toHaveBeenCalledWith('new_totp_secret');
      expect(mockValidateTotpToken).toHaveBeenCalledWith('new_totp_secret', '123456');

      const updatedMfaVerifications = updateUserById.mock.calls[0]?.[1].mfaVerifications;
      const [replacedTotpVerification] = updatedMfaVerifications ?? [];

      expect(updateUserById).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          mfaVerifications: [expect.any(Object)],
        })
      );
      expect(replacedTotpVerification).toEqual(
        expect.objectContaining({
          type: MfaFactor.TOTP,
          key: 'new_totp_secret',
        })
      );
      expect(replacedTotpVerification?.id).not.toBe(existingTotpVerification.id);
      expect(replacedTotpVerification?.createdAt).not.toBe(existingTotpVerification.createdAt);
      expect(replacedTotpVerification).not.toHaveProperty('lastUsedAt');
    });

    it('should create a new totp verification if the user has none', async () => {
      findUserById.mockResolvedValueOnce(mockUser);

      const response = await accountRequest.put('/my-account/mfa-verifications/totp').send({
        secret: 'new_totp_secret',
        code: '123456',
      });

      expect(response.status).toBe(204);
      expect(mockValidateTotpSecret).toHaveBeenCalledWith('new_totp_secret');
      expect(mockValidateTotpToken).toHaveBeenCalledWith('new_totp_secret', '123456');
      expect(updateUserById).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          mfaVerifications: [
            expect.objectContaining({
              type: 'Totp',
              key: 'new_totp_secret',
            }),
          ],
        })
      );
    });

    it('should return 400 for an invalid totp secret', async () => {
      mockValidateTotpSecret.mockReturnValueOnce(false);

      const response = await accountRequest.put('/my-account/mfa-verifications/totp').send({
        secret: 'invalid_secret',
        code: '123456',
      });

      expect(response.status).toBe(400);
      expect(mockValidateTotpSecret).toHaveBeenCalledWith('invalid_secret');
      expect(updateUserById).not.toHaveBeenCalled();
    });

    it('should return 400 for an invalid totp code', async () => {
      mockValidateTotpToken.mockReturnValueOnce(false);

      const response = await accountRequest.put('/my-account/mfa-verifications/totp').send({
        secret: 'new_totp_secret',
        code: 'bad-code',
      });

      expect(response.status).toBe(400);
      expect(mockValidateTotpToken).toHaveBeenCalledWith('new_totp_secret', 'bad-code');
      expect(updateUserById).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/my-account/mfa-verifications passkey permission and binding', () => {
    it('should allow WebAuthn binding when passkeySignIn.enabled is true (without MFA factor)', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        mfa: { ...mockSignInExperience.mfa, factors: [] },
        passkeySignIn: { enabled: true, showPasskeyButton: true, allowAutofill: false },
      });

      const response = await accountRequest.post('/my-account/mfa-verifications').send({
        type: MfaFactor.WebAuthn,
        newIdentifierVerificationRecordId: 'fake_record_id',
      });

      // Will fail at verification record lookup, but should pass binding check
      expect(response.status).not.toBe(400);
    });

    it('should reject WebAuthn binding when both mfa.factors and passkeySignIn.enabled are off', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        mfa: { ...mockSignInExperience.mfa, factors: [] },
        passkeySignIn: { enabled: false, showPasskeyButton: false, allowAutofill: false },
      });

      const response = await accountRequest.post('/my-account/mfa-verifications').send({
        type: MfaFactor.WebAuthn,
        newIdentifierVerificationRecordId: 'fake_record_id',
      });

      expect(response.status).toBe(400);
    });

    it('should use fields.passkey for WebAuthn permission when isDevFeaturesEnabled', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      const passkeyRequest = createRequester({
        authedRoutes: [
          (router) => {
            router.use(async (ctx, next) => {
              ctx.auth = {
                ...ctx.auth,
                id: mockUser.id,
                identityVerified: true,
                scopes: new Set([UserScope.Identities]),
              };
              ctx.accountCenter = {
                enabled: true,
                fields: {
                  mfa: AccountCenterControlValue.Off,
                  passkey: AccountCenterControlValue.Edit,
                },
              };
              ctx.appendDataHookContext = jest.fn();
              return next();
            });
          },
          accountMfaRoutes as never,
        ],
        tenantContext,
      });

      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        mfa: { ...mockSignInExperience.mfa, factors: [MfaFactor.WebAuthn] },
      });

      const response = await passkeyRequest.post('/my-account/mfa-verifications').send({
        type: MfaFactor.WebAuthn,
        newIdentifierVerificationRecordId: 'fake_record_id',
      });

      // Should pass permission check (passkey=Edit) even though mfa=Off
      expect(response.status).not.toBe(400);
    });

    it('should fall back to fields.mfa for non-WebAuthn types even when isDevFeaturesEnabled', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      const response = await accountRequest.post('/my-account/mfa-verifications').send({
        type: MfaFactor.TOTP,
        secret: 'totp_secret',
      });

      // Uses fields.mfa which is Edit, so permission passes; TOTP is in factors
      expect(response.status).toBe(204);
    });
  });

  describe('PATCH /api/my-account/mfa-verifications/:id/name passkey permission', () => {
    it('should use fields.passkey for permission when isDevFeaturesEnabled', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      const passkeyRequest = createRequester({
        authedRoutes: [
          (router) => {
            router.use(async (ctx, next) => {
              ctx.auth = {
                ...ctx.auth,
                id: mockUser.id,
                identityVerified: true,
                scopes: new Set([UserScope.Identities]),
              };
              ctx.accountCenter = {
                enabled: true,
                fields: {
                  mfa: AccountCenterControlValue.Off,
                  passkey: AccountCenterControlValue.Edit,
                },
              };
              ctx.appendDataHookContext = jest.fn();
              return next();
            });
          },
          accountMfaRoutes as never,
        ],
        tenantContext,
      });

      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      });

      const response = await passkeyRequest
        .patch(`/my-account/mfa-verifications/${mockUserWebAuthnMfaVerification.id}/name`)
        .send({ name: 'new-name' });

      expect(response.status).toBe(200);
    });

    it('should reject when passkey field is not editable with isDevFeaturesEnabled', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      const passkeyRequest = createRequester({
        authedRoutes: [
          (router) => {
            router.use(async (ctx, next) => {
              ctx.auth = {
                ...ctx.auth,
                id: mockUser.id,
                identityVerified: true,
                scopes: new Set([UserScope.Identities]),
              };
              ctx.accountCenter = {
                enabled: true,
                fields: {
                  mfa: AccountCenterControlValue.Edit,
                  passkey: AccountCenterControlValue.ReadOnly,
                },
              };
              ctx.appendDataHookContext = jest.fn();
              return next();
            });
          },
          accountMfaRoutes as never,
        ],
        tenantContext,
      });

      const response = await passkeyRequest
        .patch(`/my-account/mfa-verifications/${mockUserWebAuthnMfaVerification.id}/name`)
        .send({ name: 'new-name' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/my-account/mfa-verifications/:id passkey permission', () => {
    it('should use fields.passkey for WebAuthn verification deletion when isDevFeaturesEnabled', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      const passkeyRequest = createRequester({
        authedRoutes: [
          (router) => {
            router.use(async (ctx, next) => {
              ctx.auth = {
                ...ctx.auth,
                id: mockUser.id,
                identityVerified: true,
                scopes: new Set([UserScope.Identities]),
              };
              ctx.accountCenter = {
                enabled: true,
                fields: {
                  mfa: AccountCenterControlValue.Off,
                  passkey: AccountCenterControlValue.Edit,
                },
              };
              ctx.appendDataHookContext = jest.fn();
              return next();
            });
          },
          accountMfaRoutes as never,
        ],
        tenantContext,
      });

      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      });

      const response = await passkeyRequest.delete(
        `/my-account/mfa-verifications/${mockUserWebAuthnMfaVerification.id}`
      );

      expect(response.status).toBe(204);
    });

    it('should use fields.mfa for non-WebAuthn verification deletion when isDevFeaturesEnabled', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserTotpMfaVerification],
      });

      const response = await accountRequest.delete(
        `/my-account/mfa-verifications/${mockUserTotpMfaVerification.id}`
      );

      // Fields.mfa = Edit, so should pass
      expect(response.status).toBe(204);
    });

    it('should reject WebAuthn deletion when passkey field is not editable', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
      (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;

      const passkeyRequest = createRequester({
        authedRoutes: [
          (router) => {
            router.use(async (ctx, next) => {
              ctx.auth = {
                ...ctx.auth,
                id: mockUser.id,
                identityVerified: true,
                scopes: new Set([UserScope.Identities]),
              };
              ctx.accountCenter = {
                enabled: true,
                fields: {
                  mfa: AccountCenterControlValue.Edit,
                  passkey: AccountCenterControlValue.ReadOnly,
                },
              };
              ctx.appendDataHookContext = jest.fn();
              return next();
            });
          },
          accountMfaRoutes as never,
        ],
        tenantContext,
      });

      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      });

      const response = await passkeyRequest.delete(
        `/my-account/mfa-verifications/${mockUserWebAuthnMfaVerification.id}`
      );

      expect(response.status).toBe(400);
    });
  });
});
