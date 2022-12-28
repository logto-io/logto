import { maskUserInfo } from './format.js';

describe('maskUserInfo', () => {
  it('phone', () => {
    expect(maskUserInfo({ type: 'phone', value: '1234567890' })).toEqual({
      type: 'phone',
      value: '****7890',
    });
  });
  it('email with name less than 5', () => {
    expect(maskUserInfo({ type: 'email', value: 'test@logto.io' })).toEqual({
      type: 'email',
      value: '****@logto.io',
    });
  });
  it('email with name more than 4', () => {
    expect(maskUserInfo({ type: 'email', value: 'foo_test@logto.io' })).toEqual({
      type: 'email',
      value: 'foo_****@logto.io',
    });
  });
});
