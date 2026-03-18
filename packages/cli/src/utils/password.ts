import crypto from 'node:crypto';

import { argon2i } from 'hash-wasm';

/**
 * Encrypt the password with Argon2i encryption method.
 * Matches the core package's configuration (OWASP-recommended settings).
 */
export const encryptPassword = async (password: string): Promise<string> => {
  return argon2i({
    password,
    salt: crypto.randomBytes(16),
    iterations: 8,
    parallelism: 1,
    memorySize: 8 * 1024,
    hashLength: 32,
    outputType: 'encoded',
  });
};
