import crypto from 'node:crypto';

import { argon2i } from 'hash-wasm';

// eslint-disable-next-line import/no-unused-modules
export default async function argon2iEncrypt(password: string): Promise<string> {
  return argon2i({
    password,
    salt: crypto.randomBytes(16),
    iterations: 256,
    parallelism: 1,
    memorySize: 4096,
    hashLength: 32,
    outputType: 'encoded',
  });
}
