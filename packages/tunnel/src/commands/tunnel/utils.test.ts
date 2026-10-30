import fs from 'node:fs/promises';
import http from 'node:http';
import { type AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, expect, describe, it } from 'vitest';

import { createStaticFileProxy, getMimeType, getSafeStaticFilePath } from './utils.js';

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

  describe('createStaticFileProxy()', () => {
    const content = '0123456789';
    // eslint-disable-next-line @silverhand/fp/no-let -- assigned once the temp directory is created
    let staticPath: string;
    // eslint-disable-next-line @silverhand/fp/no-let -- assigned once the server is created
    let server: http.Server;
    // eslint-disable-next-line @silverhand/fp/no-let -- assigned once the server is listening
    let fileUrl: string;

    const requestRange = async (range: string) => fetch(fileUrl, { headers: { range } });

    beforeAll(async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- test setup
      staticPath = await fs.mkdtemp(path.join(os.tmpdir(), 'logto-tunnel-'));
      await fs.writeFile(path.join(staticPath, 'data.txt'), content);
      await fs.writeFile(path.join(staticPath, 'empty.txt'), '');

      const proxyStaticFileRequest = createStaticFileProxy(staticPath);
      // eslint-disable-next-line @silverhand/fp/no-mutation -- test setup
      server = http.createServer((request, response) => {
        void proxyStaticFileRequest(request, response);
      });
      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
      });
      // eslint-disable-next-line @silverhand/fp/no-mutation -- test setup
      fileUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/data.txt`;
    });

    afterAll(async () => {
      server.closeAllConnections();
      await new Promise((resolve) => {
        server.close(resolve);
      });
      await fs.rm(staticPath, { recursive: true, force: true });
    });

    it('should serve the whole file without a range', async () => {
      const response = await fetch(fileUrl);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-length')).toBe('10');
      expect(response.headers.get('content-range')).toBeNull();
      await expect(response.text()).resolves.toBe(content);
    });

    it('should serve an empty file without a range', async () => {
      const response = await fetch(new URL('empty.txt', fileUrl));
      expect(response.status).toBe(200);
      expect(response.headers.get('content-length')).toBe('0');
      await expect(response.text()).resolves.toBe('');
    });

    it('should serve the requested range', async () => {
      const response = await requestRange('bytes=2-5');
      expect(response.status).toBe(206);
      expect(response.headers.get('content-length')).toBe('4');
      expect(response.headers.get('content-range')).toBe('bytes 2-5/10');
      await expect(response.text()).resolves.toBe('2345');

      const openEndedResponse = await requestRange('bytes=5-');
      expect(openEndedResponse.status).toBe(206);
      expect(openEndedResponse.headers.get('content-length')).toBe('5');
      expect(openEndedResponse.headers.get('content-range')).toBe('bytes 5-9/10');
      await expect(openEndedResponse.text()).resolves.toBe('56789');
    });

    it('should clamp the range end to the file size', async () => {
      const response = await requestRange('bytes=5-99999999999');
      expect(response.status).toBe(206);
      expect(response.headers.get('content-length')).toBe('5');
      expect(response.headers.get('content-range')).toBe('bytes 5-9/10');
      await expect(response.text()).resolves.toBe('56789');
    });

    it('should respond 416 if the range starts at or after the end of the file', async () => {
      await expect(requestRange('bytes=10-20')).resolves.toHaveProperty('status', 416);
      await expect(requestRange('bytes=10-')).resolves.toHaveProperty('status', 416);
      await expect(
        fetch(new URL('empty.txt', fileUrl), { headers: { range: 'bytes=0-' } })
      ).resolves.toHaveProperty('status', 416);
    });

    it('should respond 416 if the range start is greater than its end', async () => {
      await expect(requestRange('bytes=5-2')).resolves.toHaveProperty('status', 416);
    });
  });
});
