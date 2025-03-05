import crypto from 'node:crypto';

import { argon2i } from 'hash-wasm';

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
