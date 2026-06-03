import type { User } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

export const hasSecurityVerificationMethod = (
  user: Pick<User, 'passwordEncrypted' | 'primaryEmail' | 'primaryPhone'>
): boolean =>
  Boolean(user.passwordEncrypted) || Boolean(user.primaryEmail) || Boolean(user.primaryPhone);

export const assertIdentityVerifiedIfRequired = (
  user: Pick<User, 'passwordEncrypted' | 'primaryEmail' | 'primaryPhone'>,
  identityVerified?: boolean
) => {
  if (!hasSecurityVerificationMethod(user)) {
    return;
  }

  assertThat(
    identityVerified,
    new RequestError({ code: 'verification_record.permission_denied', status: 401 })
  );
};
