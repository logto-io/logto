import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import { argon2Verify, bcryptVerify, md5, sha1, sha256 } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import { legacyVerify } from '#src/utils/password.js';

/**
 * Precomputed Argon2i hash for decoy verification. Matches `encryptPassword` defaults
 * (see `packages/core/src/workers/tasks/argon2i.ts`: iterations=8, memorySize=8*1024,
 * parallelism=1). Derived from `logto-decoy-do-not-use` with a fixed salt; never
 * accepted as a valid password.
 */
export const decoyArgon2Hash =
  '$argon2i$v=19$m=8192,t=8,p=1$bG9ndG8tZGVjb3ktc2FsdA$mH8wiuxK7kCjJZJRxvXCN5BxUczufmGgV1stRYErj6w';

const invalidCredentialsError = () =>
  new RequestError({ code: 'session.invalid_credentials', status: 422 });

/** Hash methods that reject wrong passwords much faster than Argon2i. */
const fastPasswordEncryptionMethods = new Set<UsersPasswordEncryptionMethod>([
  UsersPasswordEncryptionMethod.MD5,
  UsersPasswordEncryptionMethod.SHA1,
  UsersPasswordEncryptionMethod.SHA256,
  UsersPasswordEncryptionMethod.Legacy,
]);

export const shouldRunDecoyOnFailure = (
  passwordEncryptionMethod?: UsersPasswordEncryptionMethod
): boolean =>
  passwordEncryptionMethod === undefined ||
  fastPasswordEncryptionMethods.has(passwordEncryptionMethod);

export const runDecoyArgon2Verify = async (password: string): Promise<void> => {
  await argon2Verify({ password, hash: decoyArgon2Hash });
};

export const rejectInvalidCredentials = async (
  password: string,
  passwordEncryptionMethod?: UsersPasswordEncryptionMethod
): Promise<never> => {
  if (shouldRunDecoyOnFailure(passwordEncryptionMethod)) {
    await runDecoyArgon2Verify(password);
  }

  throw invalidCredentialsError();
};

type VerifyPasswordParams = {
  password: string;
  passwordEncrypted: string;
  passwordEncryptionMethod: UsersPasswordEncryptionMethod;
};

export const isPasswordValid = async ({
  password,
  passwordEncrypted,
  passwordEncryptionMethod,
}: VerifyPasswordParams): Promise<boolean> => {
  switch (passwordEncryptionMethod) {
    case UsersPasswordEncryptionMethod.Argon2i:
    case UsersPasswordEncryptionMethod.Argon2id:
    case UsersPasswordEncryptionMethod.Argon2d: {
      return argon2Verify({ password, hash: passwordEncrypted });
    }
    case UsersPasswordEncryptionMethod.MD5: {
      return (await md5(password)) === passwordEncrypted;
    }
    case UsersPasswordEncryptionMethod.SHA1: {
      return (await sha1(password)) === passwordEncrypted;
    }
    case UsersPasswordEncryptionMethod.SHA256: {
      return (await sha256(password)) === passwordEncrypted;
    }
    case UsersPasswordEncryptionMethod.Bcrypt: {
      return bcryptVerify({ password, hash: passwordEncrypted });
    }
    case UsersPasswordEncryptionMethod.Legacy: {
      return legacyVerify(passwordEncrypted, password);
    }
  }
};
