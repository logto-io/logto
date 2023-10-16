import { type AdminConsoleKey } from '@logto/phrases';
import { MfaPolicy } from '@logto/schemas';

export const policyOptionTitleMap: Record<MfaPolicy, AdminConsoleKey> = {
  [MfaPolicy.UserControlled]: 'mfa.user_controlled',
  [MfaPolicy.Mandatory]: 'mfa.mandatory',
};
