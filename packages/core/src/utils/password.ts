import { createHash } from 'crypto';

import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import { repeat } from '@silverhand/essentials';

import envSet from '@/env-set';
import assertThat from '@/utils/assert-that';

export const encryptPassword = (
  id: string,
  password: string,
  salt: string,
  method: UsersPasswordEncryptionMethod
): string => {
  assertThat(
    // FIXME:
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    method === UsersPasswordEncryptionMethod.SaltAndPepper,
    'password.unsupported_encryption_method',
    { method }
  );

  const sum = [...id].reduce(
    (accumulator, current) => accumulator + (current.codePointAt(0) ?? 0),
    0
  );
  const peppers = envSet.values.passwordPeppers;
  const pepper = peppers[sum % peppers.length];
  const iterationCount = envSet.values.passwordIterationCount;

  assertThat(pepper, 'password.pepper_not_found');

  const result = repeat(iterationCount, password, (password) =>
    createHash('sha256')
      .update(salt + password + pepper)
      .digest('hex')
  );

  return result;
};
