import Koa from 'koa';

import initOidc from './init.js';

describe('oidc provider init', () => {
  it('init should not throw', async () => {
    const app = new Koa();
    await expect(initOidc(app)).resolves.not.toThrow();
  });
});
