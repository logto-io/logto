import initOidc from './init.js';

describe('oidc provider init', () => {
  it('init should not throw', async () => {
    expect(() => initOidc()).not.toThrow();
  });
});
