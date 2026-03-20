import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, MfaFactor, type User } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import {
  mockSignInExperience,
  mockUser,
  mockUserTotpMfaVerification,
} from '#src/__mocks__/index.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const mockValidateTotpSecret = jest.fn();
const mockValidateTotpToken = jest.fn();

await mockEsmWithActual('../interaction/utils/totp-validation.js', () => ({
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

const accountMfaRoutes = await pickDefault(import('./mfa-verifications.js'));

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
  });

  describe('PUT /api/my-account/mfa-verifications/totp', () => {
    it('should replace the existing totp verification', async () => {
      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserTotpMfaVerification],
      });

      const response = await accountRequest.put('/my-account/mfa-verifications/totp').send({
        secret: 'new_totp_secret',
        code: '123456',
      });

      expect(response.status).toBe(204);
      expect(mockValidateTotpSecret).toHaveBeenCalledWith('new_totp_secret');
      expect(mockValidateTotpToken).toHaveBeenCalledWith('new_totp_secret', '123456');
      expect(updateUserById).toHaveBeenCalledWith(mockUser.id, {
        mfaVerifications: [{ ...mockUserTotpMfaVerification, key: 'new_totp_secret' }],
      });
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
});
