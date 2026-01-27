import {
  type BindWebAuthnPayload,
  MfaFactor,
  type MfaVerificationWebAuthn,
  type User,
  type WebAuthnRegistrationOptions,
  type MfaVerifications,
  type WebAuthnVerificationPayload,
  type VerifyMfaResult,
} from '@logto/schemas';
import { getUserDisplayName } from '@logto/shared';
import {
  type GenerateRegistrationOptionsOpts,
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
  type GenerateAuthenticationOptionsOpts,
  generateAuthenticationOptions,
  type VerifyAuthenticationResponseOpts,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

type GenerateWebAuthnRegistrationOptionsParameters = {
  rpId: string;
  user: Pick<
    User,
    'id' | 'name' | 'username' | 'primaryEmail' | 'primaryPhone' | 'mfaVerifications'
  >;
};

const { isDevFeaturesEnabled } = EnvSet.values;

export const generateWebAuthnRegistrationOptions = async ({
  rpId,
  user,
}: GenerateWebAuthnRegistrationOptionsParameters): Promise<WebAuthnRegistrationOptions> => {
  const { username, name, primaryEmail, primaryPhone, id, mfaVerifications } = user;

  const options: GenerateRegistrationOptionsOpts = {
    rpName: rpId,
    rpID: rpId,
    userID: Uint8Array.from(Buffer.from(id)),
    userName: getUserDisplayName({ username, primaryEmail, primaryPhone }) ?? 'Unnamed User',
    userDisplayName:
      getUserDisplayName({ name, username, primaryEmail, primaryPhone }) ?? 'Unnamed User',
    timeout: 60_000,
    attestationType: 'none',
    excludeCredentials: mfaVerifications
      .filter(
        (verification): verification is MfaVerificationWebAuthn =>
          verification.type === MfaFactor.WebAuthn
      )
      .map(({ credentialId, transports }) => ({
        id: credentialId,
        type: 'public-key',
        transports,
      })),
    authenticatorSelection: isDevFeaturesEnabled
      ? {
          // Set to `required` so newly generated credentials are discoverable and can be used
          // for passkey sign-in.
          residentKey: 'required',
          requireResidentKey: true,
          userVerification: 'required',
        }
      : {
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
  origins: string[]
) => {
  const options: VerifyRegistrationResponseOpts = {
    response: {
      ...payload,
      type: 'public-key',
    },
    expectedChallenge: challenge,
    expectedOrigin: origins,
    // Enforce verification to align with passkey sign-in requirements
    requireUserVerification: isDevFeaturesEnabled,
  };

  try {
    return await verifyRegistrationResponse(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new RequestError('session.mfa.webauthn_verification_failed', {
      message,
    });
  }
};

export const generateWebAuthnAuthenticationOptions = async ({
  rpId,
  mfaVerifications,
  allowDiscoverable = false,
}: {
  rpId: string;
  mfaVerifications: MfaVerifications;
  /** Allow generating options without allowCredentials (discoverable passkeys) */
  allowDiscoverable?: boolean;
}) => {
  const webAuthnVerifications = mfaVerifications.filter(
    (verification): verification is MfaVerificationWebAuthn =>
      verification.type === MfaFactor.WebAuthn
  );

  if (webAuthnVerifications.length === 0 && !allowDiscoverable) {
    throw new RequestError('session.mfa.webauthn_verification_not_found');
  }

  const options: GenerateAuthenticationOptionsOpts = {
    timeout: 60_000,
    allowCredentials: webAuthnVerifications.map(({ credentialId, transports }) => ({
      id: credentialId,
      type: 'public-key',
      transports,
    })),
    userVerification: 'required',
    rpID: rpId,
  };
  return generateAuthenticationOptions(options);
};

type VerifyWebAuthnAuthenticationParameters = {
  payload: Omit<WebAuthnVerificationPayload, 'type'>;
  challenge: string;
  rpId: string;
  origin: string;
  mfaVerifications: MfaVerifications;
};

export const verifyWebAuthnAuthentication = async ({
  payload,
  challenge,
  rpId,
  origin,
  mfaVerifications,
}: VerifyWebAuthnAuthenticationParameters): Promise<{
  result: false | VerifyMfaResult;
  newCounter?: number;
}> => {
  const webAuthnVerifications = mfaVerifications.filter(
    (verification): verification is MfaVerificationWebAuthn =>
      verification.type === MfaFactor.WebAuthn
  );
  const verification = webAuthnVerifications.find(
    ({ credentialId }) => credentialId === payload.id
  );

  if (!verification) {
    return { result: false };
  }

  const { publicKey, credentialId, counter, transports, id } = verification;

  const options: VerifyAuthenticationResponseOpts = {
    response: {
      ...payload,
      type: 'public-key',
    },
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpId,
    authenticator: {
      credentialPublicKey: isoBase64URL.toBuffer(publicKey),
      credentialID: credentialId,
      counter,
      transports,
    },
    requireUserVerification: true,
  };

  try {
    const { verified, authenticationInfo } = await verifyAuthenticationResponse(options);
    if (!verified) {
      return { result: false };
    }
    return {
      result: {
        type: MfaFactor.WebAuthn,
        id,
      },
      newCounter: authenticationInfo.newCounter,
    };
  } catch {
    return { result: false };
  }
};
