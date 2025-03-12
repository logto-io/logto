import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findUp } from 'find-up';
import { Tinypool } from 'tinypool';

/**
 * User password encryption worker pool.
 *
 * @remarks
 * This worker pool is used to encrypt user password with Argon2i encryption method.
 * Since the encryption process is CPU intensive,
 * to better protect the main thread I/O performance,
 * we use separate thread threads to handle the encryption process.
 */
const passwordEncryptionWorker = new Tinypool({
  // Find the worker script file path under the build directory.
  filename: path.join(
    (await findUp('build', { type: 'directory', cwd: fileURLToPath(import.meta.url) })) ?? '',
    'workers/tasks/argon2i.js'
  ),
  maxThreads: 2,
  // By default the worker will be terminated immediately after the task is completed.
  // Since starting and terminating a worker thread can lead to some performance overhead,
  // Set the idle timeout to 5 seconds will keep the worker thread alive for concurrent requests.
  // See {@link https://piscinajs.dev/api-reference/Instance/#constructor-new-piscinaoptions} for more details
  idleTimeout: 5000,
});

export default passwordEncryptionWorker;
