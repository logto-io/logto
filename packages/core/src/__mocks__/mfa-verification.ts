import { MfaFactor, type BindMfa, type BindWebAuthn } from '@logto/schemas';

export const mockTotpBind: BindMfa = {
  type: MfaFactor.TOTP,
  secret: 'secret',
};

export const mockWebAuthnBind: BindWebAuthn = {
  type: MfaFactor.WebAuthn,
  credentialId: 'credentialId',
  publicKey: 'publicKey',
  counter: 0,
  agent: 'agent',
  transports: [],
};
