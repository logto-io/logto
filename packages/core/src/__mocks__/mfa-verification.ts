import { MfaFactor, type BindMfa, type BindWebAuthn, type BindBackupCode } from '@logto/schemas';

export const mockTotpBind: BindMfa = {
  type: MfaFactor.TOTP,
  secret: 'secret',
};

export const mockWebAuthnBind: BindWebAuthn = {
  type: MfaFactor.WebAuthn,
  rpId: 'rpId',
  credentialId: 'credentialId',
  publicKey: 'publicKey',
  counter: 0,
  agent: 'agent',
  transports: [],
};

export const mockBackupCodeBind: BindBackupCode = {
  type: MfaFactor.BackupCode,
  codes: ['code'],
};
