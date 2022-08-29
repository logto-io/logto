import crypto from 'crypto';

import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import { argon2i } from 'hash-wasm';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

export const encryptPassword = async (
  password: string,
  method: UsersPasswordEncryptionMethod
): Promise<string> => {
  assertThat(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    method === UsersPasswordEncryptionMethod.Argon2i,
    new RequestError({ code: 'password.unsupported_encryption_method', method })
  );

  return argon2i({
    password,
    salt: crypto.randomBytes(16),
    iterations: 256,
    parallelism: 1,
    memorySize: 4096,
    hashLength: 32,
    outputType: 'encoded',
  });
};
