import { MfaFactor, VerificationType } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { getTotpTokenTimeStep } = await mockEsmWithActual(
  '#src/libraries/verification-helpers/totp-validation.js',
  () => ({
    getTotpTokenTimeStep: jest.fn().mockReturnValue(100),
  })
);

const { TotpVerification } = await import('./totp-verification.js');

describe('TotpVerification', () => {
  const userId = 'userId';
  const findUserById = jest.fn();
  const updateUserById = jest.fn();
  const tenant = new MockTenant(undefined, {
    users: { findUserById, updateUserById },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getTotpTokenTimeStep.mockReturnValue(100);
  });

  const createVerification = () =>
    new TotpVerification(tenant.libraries, tenant.queries, {
      id: 'verificationId',
      type: VerificationType.TOTP,
      verified: false,
      userId,
    });

  it('should verify existing TOTP and persist the used time step', async () => {
    findUserById.mockResolvedValueOnce({
      mfaVerifications: [
        {
          id: 'totpId',
          type: MfaFactor.TOTP,
          key: 'key',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });

    const verification = createVerification();

    await verification.verifyUserExistingTotp('123456');

    expect(verification.isVerified).toBe(true);
    expect(updateUserById).toHaveBeenCalledWith(userId, {
      mfaVerifications: [
        expect.objectContaining({
          id: 'totpId',
          lastUsedTimeStep: 100,
        }),
      ],
    });
  });

  it('should reject a TOTP code whose time step was already used', async () => {
    findUserById.mockResolvedValueOnce({
      mfaVerifications: [
        {
          id: 'totpId',
          type: MfaFactor.TOTP,
          key: 'key',
          createdAt: '2024-01-01T00:00:00.000Z',
          lastUsedTimeStep: 100,
        },
      ],
    });

    const verification = createVerification();

    await expect(verification.verifyUserExistingTotp('123456')).rejects.toEqual(
      new RequestError('session.mfa.invalid_totp_code')
    );
    expect(updateUserById).not.toHaveBeenCalled();
  });
});
