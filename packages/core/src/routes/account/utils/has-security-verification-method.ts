import type { User } from '@logto/schemas';

export const hasSecurityVerificationMethod = (
  user: Pick<User, 'passwordEncrypted' | 'primaryEmail' | 'primaryPhone'>
): boolean =>
  Boolean(user.passwordEncrypted) || Boolean(user.primaryEmail) || Boolean(user.primaryPhone);
