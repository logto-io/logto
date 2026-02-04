import {
  webAuthnRegistrationOptionsGuard,
  webAuthnAuthenticationOptionsGuard,
  type WebAuthnAuthenticationOptions,
} from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { base64URLStringToBuffer, bufferToBase64URLString } from '@simplewebauthn/browser';
import { type AuthenticationResponseJSON } from '@simplewebauthn/types';

import { type WebAuthnOptions } from '@/types';

export const isWebAuthnOptions = (options: Record<string, unknown>): options is WebAuthnOptions =>
  webAuthnRegistrationOptionsGuard.safeParse(options).success ||
  webAuthnAuthenticationOptionsGuard.safeParse(options).success;

export const toPublicKeyRequest = (
  options: WebAuthnAuthenticationOptions
): PublicKeyCredentialRequestOptions => {
  return {
    ...options,
    challenge: base64URLStringToBuffer(options.challenge),
    // Set `allowCredentials` to empty array since credentials should be discoverable
    allowCredentials: [],
  };
};

enum WebAuthnAuthenticatorAttachment {
  Platform = 'platform',
  CrossPlatform = 'cross-platform',
}

export const toAuthenticationResponseJSON = (
  credential: PublicKeyCredential
): AuthenticationResponseJSON => {
  if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
    throw new TypeError('Invalid credential response type');
  }

  const authenticatorAttachment =
    credential.authenticatorAttachment === WebAuthnAuthenticatorAttachment.Platform ||
    credential.authenticatorAttachment === WebAuthnAuthenticatorAttachment.CrossPlatform
      ? credential.authenticatorAttachment
      : undefined;

  return {
    id: credential.id,
    rawId: bufferToBase64URLString(credential.rawId),
    type: 'public-key',
    response: {
      clientDataJSON: bufferToBase64URLString(credential.response.clientDataJSON),
      authenticatorData: bufferToBase64URLString(credential.response.authenticatorData),
      signature: bufferToBase64URLString(credential.response.signature),
      userHandle: cond(
        credential.response.userHandle && bufferToBase64URLString(credential.response.userHandle)
      ),
    },
    authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
  };
};
