import { MfaFactor, type BindMfa } from '@logto/schemas';

export const mockTotpBind: BindMfa = {
  type: MfaFactor.TOTP,
  secret: 'secret',
};
