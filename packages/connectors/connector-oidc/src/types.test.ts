import { scopePostProcessor } from './types.js';

describe('scopePostProcessor', () => {
  it('`openid` will be added if not exists (with empty string)', () => {
    expect(scopePostProcessor('')).toEqual('openid');
  });

  it('`openid` will be added if not exists (with non-empty string)', () => {
    expect(scopePostProcessor('profile')).toEqual('profile openid');
  });

  it('return original input if openid exists', () => {
    expect(scopePostProcessor('profile openid')).toEqual('profile openid');
  });
});
