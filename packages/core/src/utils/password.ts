import crypto from 'node:crypto';

import { type PasswordPolicyChecker } from '@logto/core-kit';
import { type User, UsersPasswordEncryptionMethod } from '@logto/schemas';
import { condObject } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import passwordEncryptionWorker from '../workers/password-encryption-worker.js';

import { safeParseJson } from './json.js';

type LegacyPassword = {
  // `openssl list -digest-algorithms` will display the available digest algorithms.
  algorithm: string;
  args: string[];
  encryptedPassword: string;
};

function isPbkdf2Algorithm(algorithm: string): boolean {
  return algorithm === 'pbkdf2Sync' || algorithm === 'pbkdf2';
}

function isLegacyHashAlgorithm(algorithm: string): boolean {
  if (isPbkdf2Algorithm(algorithm)) {
    return true;
  }

  try {
    crypto.createHash(algorithm);
    return true;
  } catch {
    return false;
  }
}

function isLegacyPassword(value: string): [string, string[], string] | undefined {
  const json = safeParseJson(value);

  if (json === undefined) {
    return;
  }

  const legacyPasswordSchema = z.tuple([
    z.string(),
    z.array(z.string()).refine((args) => args.includes('@'), {
      message: "Password args must include '@' character",
    }),
    z.string(),
  ]);

  const parsed = legacyPasswordSchema.safeParse(json);

  if (parsed.success) {
    const [algorithm, args, encryptedPassword] = parsed.data;
    return [algorithm, args, encryptedPassword];
  }
}

/**
 * Parse legacy password expression in format: `['hash_method', ['args0', 'args1', '@'], 'hashed_password']` where `@` will be replaced with the input password.
 * @example parseLegacyPassword(['sha256', ['salt123', 'salt12345', '@'], 'hashed2345'])
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
 * @returns The calculated hash as a hexadecimal string
 */
export const executeLegacyHash = async (
  parsedExpression: LegacyPassword,
  inputPassword: string
): Promise<string> => {
  const { algorithm, args } = parsedExpression;

  // Replace @ with input password
  const resolvedArgs = args.map((arg) => (arg === '@' ? inputPassword : arg));
  const inputString = resolvedArgs.join('');

  if (isPbkdf2Algorithm(algorithm)) {
    const [salt, iterations, keylen, digest] = resolvedArgs;
    if (!salt || !iterations || !keylen || !digest) {
      throw new RequestError({ code: 'password.invalid_legacy_password_format' });
    }

    return crypto
      .pbkdf2Sync(
        inputPassword,
        salt,
        Number.parseInt(`${iterations}`, 10),
        Number.parseInt(`${keylen}`, 10),
        digest
      )
      .toString('hex');
  }

  // Use `node:crypto` for hash calculation
  const hash = crypto.createHash(algorithm);
  hash.update(inputString);
  return hash.digest('hex');
};

/**
 * Verifies if the provided input password matches the stored legacy password hash
 * by parsing the legacy password format, calculating the hash with the same algorithm,
 * and comparing the results. Returns false if any errors occur during verification.
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

  // Encrypt password with Argon2i encryption method in a separate worker thread
  const result: unknown = await passwordEncryptionWorker.run(password);

  if (typeof result !== 'string') {
    throw new TypeError('Invalid password encryption worker response');
  }

  return result;
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
