import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import argon2 from 'argon2';

import assertThat from '@/utils/assert-that';

export const encryptPassword = async (
  password: string,
  method: UsersPasswordEncryptionMethod
): Promise<string> => {
  assertThat(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    method === UsersPasswordEncryptionMethod.Argon2i,
    'password.unsupported_encryption_method',
    { method }
  );

  return argon2.hash(password, { timeCost: 100 });
};
