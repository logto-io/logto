import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, expect, describe, it } from 'vitest';

import { getMimeType, getSafeStaticFilePath } from './utils.js';

describe('Tunnel utils', () => {
  it('should be able to get mime type according to request path', () => {
    expect(getMimeType('/scripts.js')).toEqual('text/javascript');
    expect(getMimeType('/image.png')).toEqual('image/png');
    expect(getMimeType('/style.css')).toEqual('text/css');
    expect(getMimeType('/index.html')).toEqual('text/html');
    expect(getMimeType('/')).toEqual('text/html; charset=utf-8');
  });

  describe('getSafeStaticFilePath()', () => {
    /**
     * Directory layout:
     * - static/index.html
     * - static/scripts.js
     * - static/assets/app.js
     * - static/linked-app.js -> static/assets/app.js
     * - static/linked-secret.txt -> secret.txt
     * - static/linked-outside -> outside
     * - static-link -> static
     * - secret.txt
     * - outside/secret.txt
     */
    // eslint-disable-next-line @silverhand/fp/no-let -- assigned once the temp directory is created
    let temporaryRoot: string;
    // eslint-disable-next-line @silverhand/fp/no-let -- assigned once the temp directory is created
    let staticPath: string;

    beforeAll(async () => {
      // Resolve the real path since the OS temp directory may itself be a symlink (e.g. on macOS)
      // eslint-disable-next-line @silverhand/fp/no-mutation -- test setup
      temporaryRoot = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'logto-tunnel-')));
      // eslint-disable-next-line @silverhand/fp/no-mutation -- test setup
      staticPath = path.join(temporaryRoot, 'static');

      await fs.mkdir(path.join(staticPath, 'assets'), { recursive: true });
      await fs.mkdir(path.join(temporaryRoot, 'outside'));
      await Promise.all([
        fs.writeFile(path.join(staticPath, 'index.html'), '<html></html>'),
        fs.writeFile(path.join(staticPath, 'scripts.js'), ''),
        fs.writeFile(path.join(staticPath, 'assets/app.js'), ''),
        fs.writeFile(path.join(temporaryRoot, 'secret.txt'), 'secret'),
        fs.writeFile(path.join(temporaryRoot, 'outside/secret.txt'), 'secret'),
      ]);
      await Promise.all([
        fs.symlink(path.join(staticPath, 'assets/app.js'), path.join(staticPath, 'linked-app.js')),
        fs.symlink(
          path.join(temporaryRoot, 'secret.txt'),
          path.join(staticPath, 'linked-secret.txt')
        ),
        fs.symlink(
          path.join(temporaryRoot, 'outside'),
          path.join(staticPath, 'linked-outside'),
          'dir'
        ),
        fs.symlink(staticPath, path.join(temporaryRoot, 'static-link'), 'dir'),
      ]);
    });

    afterAll(async () => {
      await fs.rm(temporaryRoot, { recursive: true, force: true });
    });

    it('should resolve static file paths within the static root', async () => {
      await expect(getSafeStaticFilePath(staticPath, '/scripts.js')).resolves.toEqual(
        path.join(staticPath, 'scripts.js')
      );
      await expect(getSafeStaticFilePath(staticPath, '/assets/app.js?v=1')).resolves.toEqual(
        path.join(staticPath, 'assets/app.js')
      );
    });

    it('should resolve symlinks that point within the static root', async () => {
      await expect(getSafeStaticFilePath(staticPath, '/linked-app.js')).resolves.toEqual(
        path.join(staticPath, 'assets/app.js')
      );
    });

    it('should support a static root that is a symlink', async () => {
      await expect(
        getSafeStaticFilePath(path.join(temporaryRoot, 'static-link'), '/scripts.js')
      ).resolves.toEqual(path.join(staticPath, 'scripts.js'));
    });

    it('should reject static file paths outside the static root', async () => {
      await expect(getSafeStaticFilePath(staticPath, '/../secret.txt')).resolves.toBeUndefined();
      await expect(getSafeStaticFilePath(staticPath, '/..%2fsecret.txt')).resolves.toBeUndefined();
      await expect(getSafeStaticFilePath(staticPath, '/..%5csecret.txt')).resolves.toBeUndefined();
      await expect(getSafeStaticFilePath(staticPath, '/%2e%2e%2f.env')).resolves.toBeUndefined();
      await expect(getSafeStaticFilePath(staticPath, '/../.ssh/id_rsa/.')).resolves.toBeUndefined();
    });

    it('should reject symlinks that point outside the static root', async () => {
      await expect(
        getSafeStaticFilePath(staticPath, '/linked-secret.txt')
      ).resolves.toBeUndefined();
      await expect(
        getSafeStaticFilePath(staticPath, '/linked-outside/secret.txt')
      ).resolves.toBeUndefined();
    });

    it('should return undefined for files that do not exist', async () => {
      await expect(getSafeStaticFilePath(staticPath, '/missing.js')).resolves.toBeUndefined();
    });
  });
});
