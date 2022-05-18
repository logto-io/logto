import { Passcode, PasscodeType } from '@logto/schemas';

import { maskPasscode, maskPasscodeString, maskUserInfo } from '@/utils/format';

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

describe('maskPasscodeString', () => {
  const passcode = '123456';

  it('should not equal to original content', () => {
    expect(maskPasscodeString(passcode)).not.toEqual(passcode);
  });

  it('should mask the first 3 characters', () => {
    expect(maskPasscodeString(passcode)).toEqual('***456');
  });
});

describe('maskPasscode', () => {
  it('should not equal to original content', () => {
    const passcodeObject: Passcode = {
      id: '0ciWkpLZBl_To87bjqkpo',
      code: '123456',
      type: PasscodeType.Register,
      email: 'silverhand@silverhand.io',
      phone: '12345678901',
      consumed: false,
      tryCount: 0,
      createdAt: 1_652_854_353_183,
      interactionJti: '_XuSax3F6byyYijXsxfpw',
    };
    expect(maskPasscode(passcodeObject)).not.toEqual(passcodeObject);
  });
});
