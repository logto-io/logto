import path from 'node:path';

import { expect, describe, it } from 'vitest';

import { getMimeType, getSafeStaticFilePath } from './utils.js';

describe('Tunnel utils', () => {
  it('should be able to get mime type according to request path', () => {
    expect(getMimeType('/scripts.js')).toEqual('text/javascript');
    expect(getMimeType('/image.png')).toEqual('image/png');
    expect(getMimeType('/style.css')).toEqual('text/css');
    expect(getMimeType('/index.html')).toEqual('text/html');
    expect(getMimeType('/')).toEqual('text/html; charset=utf-8');
  });

  it('should resolve static file paths within the static root', () => {
    const staticPath = '/tmp/logto-ui/static';

    expect(getSafeStaticFilePath(staticPath, '/scripts.js')).toEqual(
      path.resolve(staticPath, 'scripts.js')
    );
    expect(getSafeStaticFilePath(staticPath, '/assets/app.js?v=1')).toEqual(
      path.resolve(staticPath, 'assets/app.js')
    );
  });

  it('should reject static file paths outside the static root', () => {
    const staticPath = '/tmp/logto-ui/static';

    expect(getSafeStaticFilePath(staticPath, '/../secret.txt')).toBeUndefined();
    expect(getSafeStaticFilePath(staticPath, '/..%2fsecret.txt')).toBeUndefined();
    expect(getSafeStaticFilePath(staticPath, '/..%5csecret.txt')).toBeUndefined();
    expect(getSafeStaticFilePath(staticPath, '/%2e%2e%2f.env')).toBeUndefined();
    expect(getSafeStaticFilePath(staticPath, '/../.ssh/id_rsa/.')).toBeUndefined();
  });
});
