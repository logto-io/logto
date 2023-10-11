import { MfaFactor } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import {
  mockUser,
  mockUserTotpMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/user.js';
import {
  mockBindWebAuthnPayload,
  mockWebAuthnAuthenticationOptions,
  mockWebAuthnRegistrationOptions,
  mockWebAuthnVerificationPayload,
} from '#src/__mocks__/webauthn.js';
import RequestError from '#src/errors/RequestError/index.js';

const { jest } = import.meta;

const { mockEsmWithActual } = createMockUtils(jest);

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = await mockEsmWithActual('@simplewebauthn/server', () => ({
  generateRegistrationOptions: jest.fn().mockResolvedValue(mockWebAuthnRegistrationOptions),
  verifyRegistrationResponse: jest.fn().mockResolvedValue({ verified: true }),
  generateAuthenticationOptions: jest.fn().mockResolvedValue(mockWebAuthnAuthenticationOptions),
  verifyAuthenticationResponse: jest
    .fn()
    .mockResolvedValue({ verified: true, authenticationInfo: { newCounter: 1 } }),
}));

const {
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  generateWebAuthnAuthenticationOptions,
  verifyWebAuthnAuthentication,
} = await import('./webauthn.js');

const rpId = 'logto.io';
const origin = 'https://logto.io';

describe('generateWebAuthnRegistrationOptions', () => {
  it('should generate registration options', async () => {
    await expect(
      generateWebAuthnRegistrationOptions({ rpId, user: mockUser })
    ).resolves.toMatchObject(mockWebAuthnRegistrationOptions);
    expect(generateRegistrationOptions).toHaveBeenCalled();
  });
});

describe('verifyWebAuthnRegistration', () => {
  it('should verify registration response', async () => {
    await expect(
      verifyWebAuthnRegistration(mockBindWebAuthnPayload, 'challenge', rpId, origin)
    ).resolves.toHaveProperty('verified', true);
    expect(verifyRegistrationResponse).toHaveBeenCalled();
  });
});

describe('generateWebAuthnAuthenticationOptions', () => {
  it('should generate authentication options', async () => {
    await expect(
      generateWebAuthnAuthenticationOptions({
        rpId,
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      })
    ).resolves.toMatchObject(mockWebAuthnAuthenticationOptions);
    expect(generateAuthenticationOptions).toHaveBeenCalled();
  });

  it('should throw when user webauthn verification can not be found', async () => {
    await expect(
      generateWebAuthnAuthenticationOptions({
        rpId,
        mfaVerifications: [mockUserTotpMfaVerification],
      })
    ).rejects.toMatchError(new RequestError('session.mfa.webauthn_verification_not_found'));
  });
});

describe('verifyWebAuthnAuthentication', () => {
  it('should verify authentication response', async () => {
    await expect(
      verifyWebAuthnAuthentication({
        payload: {
          ...mockWebAuthnVerificationPayload,
          id: mockUserWebAuthnMfaVerification.credentialId,
        },
        challenge: 'challenge',
        rpId,
        origin,
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      })
    ).resolves.toMatchObject({
      result: { type: MfaFactor.WebAuthn, id: mockUserWebAuthnMfaVerification.id },
      newCounter: 1,
    });
    expect(verifyAuthenticationResponse).toHaveBeenCalled();
  });

  it('should return false result when the corresponding webauthn verification can not be found', async () => {
    await expect(
      verifyWebAuthnAuthentication({
        payload: {
          ...mockWebAuthnVerificationPayload,
          id: 'not_found',
        },
        challenge: 'challenge',
        rpId,
        origin,
        mfaVerifications: [mockUserWebAuthnMfaVerification],
      })
    ).resolves.toMatchObject({
      result: false,
    });
  });
});
