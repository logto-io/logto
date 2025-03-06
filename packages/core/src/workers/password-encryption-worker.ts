import path from 'node:path';

import { Piscina } from 'piscina';

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
  // We cannot use `import.meta.url` here because the file structure differs between test and production builds.
  // In production, the file is bundled, while in test mode, the original directory structure is preserved.
  filename: path.join(process.cwd(), 'build/workers/tasks/argon2i.js'),
  maxThreads: 2,
  // By default the worker will be terminated immediately after the task is completed.
  // Starting and terminating a worker thread can ead to some performance overhead.
  // Set the idle timeout to 5 seconds will keep the worker thread alive for concurrent requests.
  // See {@link https://piscinajs.dev/api-reference/Instance/#constructor-new-piscinaoptions} for more details
  idleTimeout: 5000,
});

export default passwordEncryptionWorker;
