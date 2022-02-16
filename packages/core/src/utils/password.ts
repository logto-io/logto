import { createHash } from 'crypto';

import { PasswordEncryptionMethod } from '@logto/schemas';
import { assertEnv, repeat } from '@silverhand/essentials';
import { nanoid } from 'nanoid';
import { number, string } from 'zod';

import assertThat from '@/utils/assert-that';

const peppers = string()
  .array()
  .parse(process.env.NODE_ENV === 'test' ? [nanoid()] : JSON.parse(assertEnv('PASSWORD_PEPPERS')));
const iterationCount = number()
  .min(100)
  .parse(process.env.NODE_ENV === 'test' ? 1000 : Number(assertEnv('PASSWORD_INTERATION_COUNT')));

export const encryptPassword = (
  id: string,
  password: string,
  salt: string,
  method: PasswordEncryptionMethod
): string => {
  assertThat(
    // FIXME:
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    method === PasswordEncryptionMethod.SaltAndPepper,
    'password.unsupported_encryption_method',
    { method }
  );

  const sum = [...id].reduce(
    (accumulator, current) => accumulator + (current.codePointAt(0) ?? 0),
    0
  );
  const pepper = peppers[sum % peppers.length];

  assertThat(pepper, 'password.pepper_not_found');

  const result = repeat(iterationCount, password, (password) =>
    createHash('sha256')
      .update(salt + password + pepper)
      .digest('hex')
  );

  return result;
};
