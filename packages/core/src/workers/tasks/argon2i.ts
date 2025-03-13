import crypto from 'node:crypto';

import { argon2i } from 'hash-wasm';

/**
 * Encrypt the password with Argon2i encryption method.
 *
 * This method follows the recommended configuration settings from the [OWASP Password Storage Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Password_Storage_Cheat_Sheet.md?utm_source=chatgpt.com#argon2id),
 * balancing CPU and memory usage while providing a high level of security.
 */
export default async function argon2iEncrypt(password: string): Promise<string> {
  return argon2i({
    password,
    salt: crypto.randomBytes(16),
    iterations: 8,
    parallelism: 1,
    memorySize: 8 * 1024,
    hashLength: 32,
    outputType: 'encoded',
  });
}
