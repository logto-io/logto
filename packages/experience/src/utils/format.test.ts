import { maskEmail, maskPhone } from './format';

describe('maskUserInfo', () => {
  it('maskPhone', () => {
    expect(maskPhone('1234567890')).toEqual('****7890');
  });
  it('email with name less than 5', () => {
    expect(maskEmail('test@logto.io')).toEqual('****@logto.io');
  });
  it('email with name more than 4', () => {
    expect(maskEmail('foo_test@logto.io')).toEqual('foo_****@logto.io');
  });
});
