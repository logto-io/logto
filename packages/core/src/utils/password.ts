import crypto from 'node:crypto';

import { type PasswordPolicyChecker } from '@logto/core-kit';
import { type User, UsersPasswordEncryptionMethod } from '@logto/schemas';
import { condObject } from '@silverhand/essentials';
import { argon2i } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

type LegacyPassword = {
  // `openssl list -digest-algorithms` will display the available digest algorithms.
  algorithm: string;
  args: string[];
  encryptedPassword: string;
};

function isLegacyHashAlgorithm(algorithm: string): boolean {
  try {
    crypto.createHash(algorithm);
    return true;
  } catch {
    return false;
  }
}

function isLegacyPassword(value: string): [string, string[], string] | undefined {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.length === 3 &&
      typeof parsed[0] === 'string' &&
      Array.isArray(parsed[1]) &&
      parsed[1].every((item) => typeof item === 'string') &&
      parsed[1].includes('@') &&
      typeof parsed[2] === 'string'
    ) {
      const algorithm = parsed[0];
      const args = parsed[1];
      const encryptedPassword = parsed[2];

      return [algorithm, args, encryptedPassword] as const;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Parse legacy password expression in format: ["hash_method",["args", "args2", "@"],"hashed_password"]
 * Example: ["sha256",["salt123", "salt12345", "@"],"hashed2345"]
 * @ is replaced with input password
 */
export const parseLegacyPassword = (passwordDigest: string | undefined): LegacyPassword => {
  assertThat(passwordDigest, new RequestError({ code: 'password.unsupported_encryption_method' }));

  const parsed = isLegacyPassword(passwordDigest);

  assertThat(parsed, new RequestError({ code: 'password.invalid_legacy_password_format' }));

  const [algorithm, args, encryptedPassword] = parsed;

  assertThat(
    isLegacyHashAlgorithm(algorithm),
    new RequestError({ code: 'password.unsupported_legacy_hash_algorithm', algorithm })
  );

  return {
    algorithm,
    args,
    encryptedPassword,
  };
};

/**
 * Execute hash calculation based on the parsed expression
 */
export const executeLegacyHash = async (
  parsedExpression: LegacyPassword,
  inputPassword: string
): Promise<string> => {
  const { algorithm, args } = parsedExpression;

  // Replace @ with input password
  const resolvedArgs = args.map((arg) => (arg === '@' ? inputPassword : arg));
  const inputString = resolvedArgs.join('');

  // Use node:crypto for hash calculation
  const hash = crypto.createHash(algorithm);
  hash.update(inputString);
  return hash.digest('hex');
};

/**
 * Verify legacy password
 */
export const legacyVerify = async (
  storedPassword: string,
  inputPassword: string
): Promise<boolean> => {
  try {
    const parsed = parseLegacyPassword(storedPassword);
    const calculatedHash = await executeLegacyHash(parsed, inputPassword);
    return calculatedHash === parsed.encryptedPassword;
  } catch {
    return false;
  }
};

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
