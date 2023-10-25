import crypto from 'node:crypto';

import { PasswordPolicyChecker } from '@logto/core-kit';
import { InteractionEvent, MfaFactor, MfaPolicy } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import type Provider from 'oidc-provider';

import { mockBackupCodeBind, mockTotpBind } from '#src/__mocks__/mfa-verification.js';
import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import {
  mockUser,
  mockUserBackupCodeMfaVerification,
  mockUserWithMfaVerifications,
} from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
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

const { validateBindMfaBackupCode } = await import('./mfa-verification.js');

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

const backupCodeEnabledCtx = {
  ...baseCtx,
  signInExperience: {
    ...mockSignInExperience,
    mfa: {
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
      policy: MfaPolicy.Mandatory,
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

const provider = createMockProvider();

describe('validateBindMfaBackupCode', () => {
  it('should pass if backup code is not enabled', async () => {
    await expect(
      validateBindMfaBackupCode(
        tenantContext,
        mfaRequiredCtx,
        {
          ...signInInteraction,
          bindMfas: [mockTotpBind],
        },
        provider
      )
    ).resolves.not.toThrow();
  });

  it('should pass if backup code is set in bindMfas', async () => {
    await expect(
      validateBindMfaBackupCode(
        tenantContext,
        backupCodeEnabledCtx,
        {
          ...signInInteraction,
          bindMfas: [mockTotpBind, mockBackupCodeBind],
        },
        provider
      )
    ).resolves.not.toThrow();
  });

  it('should pass if there is no other MFA for register', async () => {
    await expect(
      validateBindMfaBackupCode(tenantContext, backupCodeEnabledCtx, interaction, provider)
    ).resolves.not.toThrow();
  });

  it('should pass if there is no other MFA for sign in', async () => {
    findUserById.mockResolvedValueOnce(mockUser);
    await expect(
      validateBindMfaBackupCode(
        tenantContext,
        backupCodeEnabledCtx,
        {
          ...signInInteraction,
        },
        provider
      )
    ).resolves.not.toThrow();
  });

  it('should pass if backup code is set in user mfaVerifications', async () => {
    findUserById.mockResolvedValueOnce({
      ...mockUser,
      mfaVerifications: [mockUserBackupCodeMfaVerification],
    });
    await expect(
      validateBindMfaBackupCode(
        tenantContext,
        backupCodeEnabledCtx,
        {
          ...signInInteraction,
          bindMfas: [mockTotpBind],
        },
        provider
      )
    ).resolves.not.toThrow();
  });

  it('should reject if backup code is set in user mfaVerifications but used', async () => {
    findUserById.mockResolvedValueOnce({
      ...mockUser,
      mfaVerifications: [
        {
          ...mockUserBackupCodeMfaVerification,
          codes: [{ code: 'code', usedAt: new Date().toISOString() }],
        },
      ],
    });
    await expect(
      validateBindMfaBackupCode(
        tenantContext,
        backupCodeEnabledCtx,
        {
          ...signInInteraction,
          bindMfas: [mockTotpBind],
        },
        provider
      )
    ).rejects.toThrowError(
      new RequestError(
        { code: 'session.mfa.backup_code_required', status: 422 },
        { codes: mockBackupCodes }
      )
    );
  });

  it('should reject if backup code is not set', async () => {
    findUserById.mockResolvedValueOnce(mockUserWithMfaVerifications);

    await expect(
      validateBindMfaBackupCode(
        tenantContext,
        backupCodeEnabledCtx,
        {
          ...signInInteraction,
          bindMfas: [],
        },
        provider
      )
    ).rejects.toThrowError(
      new RequestError(
        { code: 'session.mfa.backup_code_required', status: 422 },
        { codes: mockBackupCodes }
      )
    );

    expect(storeInteractionResult).toHaveBeenCalledWith(
      {
        pendingMfa: { type: MfaFactor.BackupCode, codes: mockBackupCodes },
      },
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });
});
