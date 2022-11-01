import { UserFlow } from '@/types';

import {
  verifyForgotPasswordEmailPasscode,
  verifyForgotPasswordSmsPasscode,
} from './forgot-password';
import { verifyRegisterEmailPasscode, verifyRegisterSmsPasscode } from './register';
import { verifySignInEmailPasscode, verifySignInSmsPasscode } from './sign-in';
import { getVerifyPasscodeApi } from './utils';

describe('api', () => {
  it('getVerifyPasscodeApi', () => {
    expect(getVerifyPasscodeApi(UserFlow.register, 'sms')).toBe(verifyRegisterSmsPasscode);
    expect(getVerifyPasscodeApi(UserFlow.register, 'email')).toBe(verifyRegisterEmailPasscode);
    expect(getVerifyPasscodeApi(UserFlow.signIn, 'sms')).toBe(verifySignInSmsPasscode);
    expect(getVerifyPasscodeApi(UserFlow.signIn, 'email')).toBe(verifySignInEmailPasscode);
    expect(getVerifyPasscodeApi(UserFlow.forgotPassword, 'email')).toBe(
      verifyForgotPasswordEmailPasscode
    );
    expect(getVerifyPasscodeApi(UserFlow.forgotPassword, 'sms')).toBe(
      verifyForgotPasswordSmsPasscode
    );
  });
});
