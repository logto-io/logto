import crypto from 'node:crypto';

import { PasswordPolicyChecker } from '@logto/core-kit';
import { InteractionEvent, MfaFactor, MfaPolicy } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import type Provider from 'oidc-provider';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import {
  mockUser,
  mockUserWebAuthnMfaVerification,
  mockUserWithMfaVerifications,
  mockUserTotpMfaVerification,
  mockUserBackupCodeMfaVerification,
} from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type {
  AccountVerifiedInteractionResult,
  IdentifierVerifiedInteractionResult,
} from '../types/index.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const findUserById = jest.fn();
const updateUserById = jest.fn();

const tenantContext = new MockTenant(undefined, {
  users: {
    findUserById,
    updateUserById,
  },
});

const mockBackupCodes = ['foo'];
await mockEsmWithActual('../utils/backup-code-validation.js', () => ({
  generateBackupCodes: jest.fn().mockReturnValue(mockBackupCodes),
}));
const { storeInteractionResult } = await mockEsmWithActual('../utils/interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));

const { validateMandatoryBindMfa, verifyBindMfa, verifyMfa } = await import(
  './mfa-verification.js'
);

const baseCtx = {
  ...createContextWithRouteParameters(),
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  interactionDetails: {} as Awaited<ReturnType<Provider['interactionDetails']>>,
  signInExperience: {
    ...mockSignInExperience,
    mfa: {
      factors: [MfaFactor.TOTP],
      policy: MfaPolicy.UserControlled,
    },
  },
  passwordPolicyChecker: new PasswordPolicyChecker(
    mockSignInExperience.passwordPolicy,
    crypto.subtle
  ),
};

const mfaRequiredCtx = {
  ...baseCtx,
  signInExperience: {
    ...mockSignInExperience,
    mfa: {
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
      policy: MfaPolicy.Mandatory,
    },
  },
};

const mfaRequiredTotpOnlyCtx = {
  ...baseCtx,
  signInExperience: {
    ...mockSignInExperience,
    mfa: {
      factors: [MfaFactor.TOTP],
      policy: MfaPolicy.Mandatory,
    },
  },
};

const allFactorsEnabledCtx = {
  ...baseCtx,
  signInExperience: {
    ...mockSignInExperience,
    mfa: {
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
      policy: MfaPolicy.UserControlled,
    },
  },
};

const interaction: IdentifierVerifiedInteractionResult = {
  event: InteractionEvent.Register,
  identifiers: [{ key: 'accountId', value: 'foo' }],
};

const signInInteraction: AccountVerifiedInteractionResult = {
  event: InteractionEvent.SignIn,
  identifiers: [{ key: 'accountId', value: 'foo' }],
  accountId: 'foo',
};

describe('validateMandatoryBindMfa', () => {
  afterEach(() => {
    findUserById.mockReset();
  });

  describe('register', () => {
    it('bindMfa missing but required should throw', async () => {
      await expect(
        validateMandatoryBindMfa(tenantContext, mfaRequiredCtx, interaction)
      ).rejects.toMatchError(
        new RequestError(
          {
            code: 'user.missing_mfa',
            status: 422,
          },
          { availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn] }
        )
      );
    });

    it('bindMfas exists should pass', async () => {
      await expect(
        validateMandatoryBindMfa(tenantContext, mfaRequiredCtx, {
          ...interaction,
          bindMfas: [
            {
              type: MfaFactor.TOTP,
              secret: 'foo',
            },
          ],
        })
      ).resolves.not.toThrow();
    });

    it('bindMfa missing and not required should throw (for skip)', async () => {
      await expect(
        validateMandatoryBindMfa(tenantContext, baseCtx, interaction)
      ).rejects.toMatchError(
        new RequestError(
          {
            code: 'user.missing_mfa',
            status: 422,
          },
          { availableFactors: [MfaFactor.TOTP], skippable: true }
        )
      );
    });

    it('bindMfa missing and not required, marked as skipped should pass', async () => {
      await expect(
        validateMandatoryBindMfa(tenantContext, baseCtx, {
          ...interaction,
          mfaSkipped: true,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('signIn', () => {
    it('user mfaVerifications and bindMfa missing but required should throw', async () => {
      findUserById.mockResolvedValueOnce(mockUser);
      await expect(
        validateMandatoryBindMfa(tenantContext, mfaRequiredCtx, signInInteraction)
      ).rejects.toMatchError(
        new RequestError(
          {
            code: 'user.missing_mfa',
            status: 422,
          },
          { availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn] }
        )
      );
    });

    it('user mfaVerifications and bindMfa missing, and not required should throw (for skip)', async () => {
      findUserById.mockResolvedValueOnce(mockUser);
      await expect(
        validateMandatoryBindMfa(tenantContext, baseCtx, signInInteraction)
      ).rejects.toMatchError(
        new RequestError(
          {
            code: 'user.missing_mfa',
            status: 422,
          },
          { availableFactors: [MfaFactor.TOTP], skippable: true }
        )
      );
    });

    it('user mfaVerifications and bindMfa missing, mark skipped, and not required should pass', async () => {
      findUserById.mockResolvedValueOnce({
        ...mockUser,
        logtoConfig: {
          mfa: { skipped: true },
        },
      });
      await expect(
        validateMandatoryBindMfa(tenantContext, baseCtx, signInInteraction)
      ).resolves.not.toThrow();
    });

    it('user mfaVerifications missing, bindMfas existing and required should pass', async () => {
      findUserById.mockResolvedValueOnce(mockUser);
      await expect(
        validateMandatoryBindMfa(tenantContext, mfaRequiredCtx, {
          ...signInInteraction,
          bindMfas: [
            {
              type: MfaFactor.TOTP,
              secret: 'foo',
            },
          ],
        })
      ).resolves.not.toThrow();
    });

    it('user mfaVerifications existing, bindMfa missing and required should pass', async () => {
      findUserById.mockResolvedValueOnce(mockUserWithMfaVerifications);
      await expect(
        validateMandatoryBindMfa(tenantContext, baseCtx, signInInteraction)
      ).resolves.not.toThrow();
    });

    it('user mfaVerifications existing (unavailable factor), bindMfa missing and required should throw', async () => {
      findUserById.mockResolvedValueOnce({
        ...mockUser,
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      });
      await expect(
        validateMandatoryBindMfa(tenantContext, mfaRequiredTotpOnlyCtx, signInInteraction)
      ).rejects.toMatchError(
        new RequestError(
          {
            code: 'user.missing_mfa',
            status: 422,
          },
          { availableFactors: [MfaFactor.TOTP] }
        )
      );
    });
  });
});

describe('verifyBindMfa', () => {
  it('should pass if bindMfa is missing', async () => {
    await expect(verifyBindMfa(tenantContext, signInInteraction)).resolves.not.toThrow();
  });

  it('should pass if event is not sign in', async () => {
    await expect(
      verifyBindMfa(tenantContext, {
        ...interaction,
        bindMfas: [
          {
            type: MfaFactor.TOTP,
            secret: 'foo',
          },
        ],
      })
    ).resolves.not.toThrow();
  });

  it('pass if the user has no TOTP factor', async () => {
    findUserById.mockResolvedValueOnce(mockUser);
    await expect(
      verifyBindMfa(tenantContext, {
        ...signInInteraction,
        bindMfas: [
          {
            type: MfaFactor.TOTP,
            secret: 'foo',
          },
        ],
      })
    ).resolves.not.toThrow();
  });

  it('should reject if the user already has a TOTP factor', async () => {
    findUserById.mockResolvedValueOnce(mockUserWithMfaVerifications);
    await expect(
      verifyBindMfa(tenantContext, {
        ...signInInteraction,
        bindMfas: [
          {
            type: MfaFactor.TOTP,
            secret: 'foo',
          },
        ],
      })
    ).rejects.toMatchError(new RequestError({ code: 'user.totp_already_in_use', status: 422 }));
  });
});

describe('verifyMfa', () => {
  it('should pass if user mfaVerifications is empty', async () => {
    findUserById.mockResolvedValueOnce(mockUser);
    await expect(verifyMfa(baseCtx, tenantContext, signInInteraction)).resolves.not.toThrow();
  });

  it('should pass if user mfaVerifications is not empty but no available factor', async () => {
    findUserById.mockResolvedValueOnce({
      ...mockUser,
      mfaVerifications: [mockUserWebAuthnMfaVerification],
    });
    await expect(verifyMfa(baseCtx, tenantContext, signInInteraction)).resolves.not.toThrow();
  });

  it('should pass if verifiedMfa exists', async () => {
    findUserById.mockResolvedValueOnce(mockUserWithMfaVerifications);
    await expect(
      verifyMfa(baseCtx, tenantContext, {
        ...signInInteraction,
        verifiedMfa: {
          type: MfaFactor.TOTP,
          id: 'id',
        },
      })
    ).resolves.not.toThrow();
  });

  it('should reject if verifiedMfa can not be found', async () => {
    findUserById.mockResolvedValueOnce(mockUserWithMfaVerifications);
    await expect(
      verifyMfa(baseCtx, tenantContext, {
        ...signInInteraction,
        verifiedMfa: undefined,
      })
    ).rejects.toThrowError();
  });

  it('should reject and sort availableFactors', async () => {
    findUserById.mockResolvedValueOnce({
      ...mockUser,
      mfaVerifications: [
        {
          ...mockUserWebAuthnMfaVerification,
          lastUsedAt: new Date('2021-01-01').toISOString(),
        },
        {
          ...mockUserBackupCodeMfaVerification,
          lastUsedAt: new Date('2023-01-01').toISOString(),
        },
        {
          ...mockUserTotpMfaVerification,
          lastUsedAt: new Date('2022-01-01').toISOString(),
        },
      ],
    });
    await expect(
      verifyMfa(allFactorsEnabledCtx, tenantContext, {
        ...signInInteraction,
        verifiedMfa: undefined,
      })
    ).rejects.toMatchError(
      new RequestError(
        {
          code: 'session.mfa.require_mfa_verification',
          status: 403,
        },
        {
          availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
        }
      )
    );
  });
});
