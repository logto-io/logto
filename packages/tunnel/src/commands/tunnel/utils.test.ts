import { expect, describe, it } from 'vitest';

import { getMimeType } from './utils.js';

describe('Tunnel utils', () => {
  it('should be able to get mime type according to request path', () => {
    expect(getMimeType('/scripts.js')).toEqual('text/javascript');
    expect(getMimeType('/image.png')).toEqual('image/png');
    expect(getMimeType('/style.css')).toEqual('text/css');
    expect(getMimeType('/index.html')).toEqual('text/html');
    expect(getMimeType('/')).toEqual('text/html; charset=utf-8');
  });
});
