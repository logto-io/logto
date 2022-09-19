import { verifyRegisterEmailPasscode, verifyRegisterSmsPasscode } from './register';
import { verifyResetPasswordEmailPasscode, verifyResetPasswordSmsPasscode } from './reset-password';
import { verifySignInEmailPasscode, verifySignInSmsPasscode } from './sign-in';
import { getVerifyPasscodeApi } from './utils';

describe('api', () => {
  it('getVerifyPasscodeApi', () => {
    expect(getVerifyPasscodeApi('register', 'sms')).toBe(verifyRegisterSmsPasscode);
    expect(getVerifyPasscodeApi('register', 'email')).toBe(verifyRegisterEmailPasscode);
    expect(getVerifyPasscodeApi('sign-in', 'sms')).toBe(verifySignInSmsPasscode);
    expect(getVerifyPasscodeApi('sign-in', 'email')).toBe(verifySignInEmailPasscode);
    expect(getVerifyPasscodeApi('reset-password', 'email')).toBe(verifyResetPasswordEmailPasscode);
    expect(getVerifyPasscodeApi('reset-password', 'sms')).toBe(verifyResetPasswordSmsPasscode);
  });
});
