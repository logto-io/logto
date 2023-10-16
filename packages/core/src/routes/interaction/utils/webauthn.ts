import {
  type BindWebAuthnPayload,
  MfaFactor,
  type MfaVerificationWebAuthn,
  type User,
  type WebAuthnRegistrationOptions,
} from '@logto/schemas';
import {
  type GenerateRegistrationOptionsOpts,
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';

type GenerateWebAuthnRegistrationOptionsParameters = {
  rpId: string;
  user: Pick<User, 'id' | 'username' | 'primaryEmail' | 'primaryPhone' | 'mfaVerifications'>;
};

export const generateWebAuthnRegistrationOptions = async ({
  rpId,
  user,
}: GenerateWebAuthnRegistrationOptionsParameters): Promise<WebAuthnRegistrationOptions> => {
  const options: GenerateRegistrationOptionsOpts = {
    rpName: rpId,
    rpID: rpId,
    userID: user.id,
    userName: user.username ?? user.primaryEmail ?? user.primaryPhone ?? user.id,
    timeout: 60_000,
    attestationType: 'none',
    excludeCredentials: user.mfaVerifications
      .filter(
        (verification): verification is MfaVerificationWebAuthn =>
          verification.type === MfaFactor.WebAuthn
      )
      .map(({ credentialId, transports }) => ({
        id: Uint8Array.from(Buffer.from(credentialId, 'base64')),
        type: 'public-key',
        transports,
      })),
    authenticatorSelection: {
      residentKey: 'discouraged',
    },
    // Values for COSEALG.ES256, COSEALG.RS256, Node.js don't have those enums
    supportedAlgorithmIDs: [-7, -257],
  };

  return generateRegistrationOptions(options);
};

export const verifyWebAuthnRegistration = async (
  payload: Omit<BindWebAuthnPayload, 'type'>,
  challenge: string,
  rpId: string,
  origin: string
) => {
  const options: VerifyRegistrationResponseOpts = {
    response: {
      ...payload,
      type: 'public-key',
    },
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpId,
    requireUserVerification: true,
  };
  return verifyRegistrationResponse(options);
};
