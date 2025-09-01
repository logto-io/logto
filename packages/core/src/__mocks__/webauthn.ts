import {
  type BindWebAuthnPayload,
  MfaFactor,
  type WebAuthnAuthenticationOptions,
  type WebAuthnRegistrationOptions,
  type BindWebAuthn,
  type WebAuthnVerificationPayload,
} from '@logto/schemas';

export const mockWebAuthnRegistrationOptions: WebAuthnRegistrationOptions = {
  rp: {
    name: 'Logto',
    id: 'logto.io',
  },
  user: {
    id: 'id',
    name: 'test-user',
    displayName: 'Test User',
  },
  challenge: 'challenge',
  pubKeyCredParams: [
    {
      type: 'public-key',
      alg: -7,
    },
  ],
};

export const mockWebAuthnAuthenticationOptions: WebAuthnAuthenticationOptions = {
  challenge: 'challenge',
  allowCredentials: [
    {
      id: 'id',
      type: 'public-key',
      transports: ['internal'],
    },
  ],
  userVerification: 'preferred',
  timeout: 60_000,
  rpId: 'logto.io',
};

export const mockBindWebAuthnPayload: BindWebAuthnPayload = {
  type: MfaFactor.WebAuthn,
  id: 'id',
  rawId: 'id',
  response: {
    clientDataJSON: 'clientDataJSON',
    attestationObject: 'attestationObject',
  },
  clientExtensionResults: {},
};

export const mockBindWebAuthn: BindWebAuthn = {
  type: MfaFactor.WebAuthn,
  rpId: 'rpId',
  credentialId: 'credentialId',
  publicKey: 'publicKey',
  transports: [],
  counter: 0,
  agent: 'userAgent',
};

export const mockWebAuthnVerificationPayload: WebAuthnVerificationPayload = {
  type: MfaFactor.WebAuthn,
  id: 'id',
  rawId: 'id',
  clientExtensionResults: {},
  response: {
    clientDataJSON: 'clientDataJSON',
    authenticatorData: 'authenticatorData',
    signature: 'signature',
  },
};
