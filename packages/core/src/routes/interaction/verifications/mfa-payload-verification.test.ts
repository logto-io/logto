import { InteractionEvent, MfaFactor } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import type { Provider } from 'oidc-provider';

import {
  mockUserBackupCodeMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/user.js';
import {
  mockBindWebAuthn,
  mockBindWebAuthnPayload,
  mockWebAuthnVerificationPayload,
} from '#src/__mocks__/webauthn.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { IdentifierVerifiedInteractionResult } from '../types/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const findUserById = jest.fn();
const updateUserById = jest.fn();

const tenantContext = new MockTenant(undefined, {
  users: {
    findUserById,
    updateUserById,
  },
});

const { validateTotpToken } = mockEsm('../utils/totp-validation.js', () => ({
  validateTotpToken: jest.fn().mockReturnValue(true),
}));

const { verifyWebAuthnAuthentication, verifyWebAuthnRegistration } = mockEsm(
  '../utils/webauthn.js',
  () => ({
    verifyWebAuthnAuthentication: jest.fn(),
    verifyWebAuthnRegistration: jest.fn().mockResolvedValue({
      verified: true,
      registrationInfo: {
        credentialID: 'credentialId',
        credentialPublicKey: 'publicKey',
        counter: 0,
      },
    }),
  })
);

mockEsm('@simplewebauthn/server/helpers', () => ({
  isoBase64URL: { fromBuffer: jest.fn((value) => value) },
}));

const { bindMfaPayloadVerification, verifyMfaPayloadVerification } = await import(
  './mfa-payload-verification.js'
);

const additionalParameters = {
  rpId: 'logto.io',
  userAgent: 'userAgent',
  origin: 'https://logto.io',
};

describe('bindMfaPayloadVerification', () => {
  const baseCtx = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    interactionDetails: {} as Awaited<ReturnType<Provider['interactionDetails']>>,
  };

  const interaction: IdentifierVerifiedInteractionResult = {
    event: InteractionEvent.SignIn,
    identifiers: [{ key: 'accountId', value: 'foo' }],
    accountId: 'foo',
  };

  describe('totp', () => {
    it('should return result of BindMfa', async () => {
      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          { type: MfaFactor.TOTP, code: '123456' },
          {
            ...interaction,
            pendingMfa: {
              type: MfaFactor.TOTP,
              secret: 'secret',
            },
          },
          additionalParameters
        )
      ).resolves.toMatchObject({
        type: MfaFactor.TOTP,
        secret: 'secret',
      });

      expect(validateTotpToken).toHaveBeenCalled();
    });

    it('should reject when pendingMfa is missing', async () => {
      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          { type: MfaFactor.TOTP, code: '123456' },
          interaction,
          additionalParameters
        )
      ).rejects.toEqual(new RequestError('session.mfa.pending_info_not_found'));
    });

    it('should reject when code is invalid', async () => {
      validateTotpToken.mockReturnValueOnce(false);

      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          { type: MfaFactor.TOTP, code: '123456' },
          {
            ...interaction,
            pendingMfa: {
              type: MfaFactor.TOTP,
              secret: 'secret',
            },
          },
          additionalParameters
        )
      ).rejects.toEqual(new RequestError('session.mfa.invalid_totp_code'));
    });
  });

  describe('webauthn', () => {
    it('should return result of BindMfa', async () => {
      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          mockBindWebAuthnPayload,
          {
            ...interaction,
            pendingMfa: {
              type: MfaFactor.WebAuthn,
              challenge: 'challenge',
            },
          },
          additionalParameters
        )
      ).resolves.toMatchObject({
        ...mockBindWebAuthn,
        rpId: additionalParameters.rpId,
      });

      expect(verifyWebAuthnRegistration).toHaveBeenCalled();
    });

    it('should reject when pendingMfa is missing', async () => {
      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          mockBindWebAuthnPayload,
          interaction,
          additionalParameters
        )
      ).rejects.toEqual(new RequestError('session.mfa.pending_info_not_found'));
    });

    it('should reject when webauthn faield', async () => {
      verifyWebAuthnRegistration.mockResolvedValueOnce({
        verified: false,
      });

      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          mockBindWebAuthnPayload,
          {
            ...interaction,
            pendingMfa: {
              type: MfaFactor.WebAuthn,
              challenge: 'challenge',
            },
          },
          additionalParameters
        )
      ).rejects.toEqual(new RequestError('session.mfa.webauthn_verification_failed'));
    });
  });

  describe('backup code', () => {
    it('should return result of BindMfa', async () => {
      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          { type: MfaFactor.BackupCode },
          {
            ...interaction,
            pendingMfa: {
              type: MfaFactor.BackupCode,
              codes: ['code'],
            },
          },
          additionalParameters
        )
      ).resolves.toMatchObject({
        type: MfaFactor.BackupCode,
        codes: ['code'],
      });
    });

    it('should reject when pendingMfa is missing', async () => {
      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          { type: MfaFactor.BackupCode },
          interaction,
          additionalParameters
        )
      ).rejects.toEqual(new RequestError('session.mfa.pending_info_not_found'));
    });
  });
});

describe('verifyMfaPayloadVerification', () => {
  describe('totp', () => {
    it('should return result of VerifyMfaResult', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [{ type: MfaFactor.TOTP, key: 'key', id: 'id' }],
      });

      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          {
            type: MfaFactor.TOTP,
            code: '123456',
          },
          { event: InteractionEvent.SignIn },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).resolves.toMatchObject({
        type: MfaFactor.TOTP,
        id: 'id',
      });

      expect(findUserById).toHaveBeenCalled();
      expect(validateTotpToken).toHaveBeenCalled();
    });

    it('should reject when totp can not be found in user mfaVerifications', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [],
      });
      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          {
            type: MfaFactor.TOTP,
            code: '123456',
          },
          { event: InteractionEvent.SignIn },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).rejects.toEqual(new RequestError('session.mfa.invalid_totp_code'));
    });

    it('should reject when code is invalid', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [{ type: MfaFactor.TOTP, key: 'key', id: 'id' }],
      });
      validateTotpToken.mockReturnValueOnce(false);

      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          {
            type: MfaFactor.TOTP,
            code: '123456',
          },
          { event: InteractionEvent.SignIn },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).rejects.toEqual(new RequestError('session.mfa.invalid_totp_code'));
    });
  });

  describe('webauthn', () => {
    beforeEach(() => {
      updateUserById.mockClear();
    });

    it('should return result of VerifyMfaResult and update newCounter', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      });
      const result = { type: MfaFactor.WebAuthn, id: mockUserWebAuthnMfaVerification.id };
      verifyWebAuthnAuthentication.mockResolvedValueOnce({
        result,
        newCounter: 1,
      });

      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          mockWebAuthnVerificationPayload,
          {
            event: InteractionEvent.SignIn,
            pendingMfa: { type: MfaFactor.WebAuthn, challenge: 'challenge' },
          },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).resolves.toMatchObject(result);

      expect(updateUserById).toHaveBeenCalledWith('accountId', {
        mfaVerifications: [{ ...mockUserWebAuthnMfaVerification, counter: 1 }],
      });
    });

    it('should reject when pendingMfa can not be found', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      });
      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          mockWebAuthnVerificationPayload,
          {
            event: InteractionEvent.SignIn,
          },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).rejects.toEqual(new RequestError('session.mfa.pending_info_not_found'));
    });

    it('should reject when webauthn result is false', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      });
      verifyWebAuthnAuthentication.mockReturnValueOnce({ result: false });

      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          mockWebAuthnVerificationPayload,
          {
            event: InteractionEvent.SignIn,
            pendingMfa: { type: MfaFactor.WebAuthn, challenge: 'challenge' },
          },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).rejects.toEqual(new RequestError('session.mfa.webauthn_verification_failed'));
    });
  });

  describe('backup code', () => {
    it('should return result of VerifyMfaResult and mark as used', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [mockUserBackupCodeMfaVerification],
      });

      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          {
            type: MfaFactor.BackupCode,
            code: 'code',
          },
          { event: InteractionEvent.SignIn },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).resolves.toMatchObject({
        type: MfaFactor.BackupCode,
        id: mockUserBackupCodeMfaVerification.id,
      });

      expect(findUserById).toHaveBeenCalled();
      expect(updateUserById).toHaveBeenCalledWith('accountId', {
        mfaVerifications: [
          {
            ...mockUserBackupCodeMfaVerification,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            codes: [{ code: 'code', usedAt: expect.anything() }],
          },
        ],
      });
    });

    it('should reject when backup code can not be found in user mfaVerifications', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [],
      });
      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          {
            type: MfaFactor.BackupCode,
            code: 'code',
          },
          { event: InteractionEvent.SignIn },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).rejects.toEqual(new RequestError('session.mfa.invalid_backup_code'));
    });

    it('should reject when code is used', async () => {
      findUserById.mockResolvedValueOnce({
        mfaVerifications: [
          {
            ...mockUserBackupCodeMfaVerification,
            codes: [{ code: 'code', usedAt: new Date().toISOString() }],
          },
        ],
      });
      validateTotpToken.mockReturnValueOnce(false);

      await expect(
        verifyMfaPayloadVerification(
          tenantContext,
          {
            type: MfaFactor.BackupCode,
            code: 'code',
          },
          { event: InteractionEvent.SignIn },
          { rpId: 'rpId', origin: 'origin', accountId: 'accountId' }
        )
      ).rejects.toEqual(new RequestError('session.mfa.invalid_backup_code'));
    });
  });
});
