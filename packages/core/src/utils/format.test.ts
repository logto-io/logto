import { maskUserInfo } from './format';

describe('maskUserInfo', () => {
  it('phone', () => {
    expect(maskUserInfo({ type: 'phone', value: '1234567890' })).toBe('****7890');
  });
  it('email with name less than 5', () => {
    expect(maskUserInfo({ type: 'email', value: 'test@logto.io' })).toBe('****@logto.io');
  });
  it('email with name more than 4', () => {
    expect(maskUserInfo({ type: 'email', value: 'foo_test@logto.io' })).toBe('foo_****@logto.io');
  });
});
