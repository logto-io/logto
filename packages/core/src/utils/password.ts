import crypto from 'node:crypto';

import { type PasswordPolicyChecker } from '@logto/core-kit';
import { type User, UsersPasswordEncryptionMethod } from '@logto/schemas';
import { condObject } from '@silverhand/essentials';
import { argon2i } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

export const encryptPassword = async (
  password: string,
  method: UsersPasswordEncryptionMethod
): Promise<string> => {
  assertThat(
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

export const checkPasswordPolicyForUser = async (
  policyChecker: PasswordPolicyChecker,
  password: string,
  user: User
) => {
  return policyChecker.check(
    password,
    condObject({
      email: user.primaryEmail,
      username: user.username,
      phoneNumber: user.primaryPhone,
      name: user.name,
    })
  );
};
