import os from 'node:os';
import path from 'node:path';

import { Piscina } from 'piscina';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

/**
 * User password encryption worker pool.
 *
 * @remarks
 * This worker pool is used to encrypt user password with Argon2i encryption method.
 * Since the encryption process is CPU intensive,
 * to better protect the main thread I/O performance,
 * we use separate thread threads to handle the encryption process.
 */
const passwordEncryptionWorker = new Piscina<string, string>({
  filename: path.join(__dirname, './workers/tasks/argon2i.js'),
  maxThreads: os.availableParallelism() * 0.5,
  // {@link https://piscinajs.dev/api-reference/Instance#constructor-new-piscinaoptions}
});

export default passwordEncryptionWorker;
