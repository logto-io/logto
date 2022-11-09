import { SignInIdentifier } from '@logto/schemas';

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
    expect(getVerifyPasscodeApi(UserFlow.register, SignInIdentifier.Sms)).toBe(
      verifyRegisterSmsPasscode
    );
    expect(getVerifyPasscodeApi(UserFlow.register, SignInIdentifier.Email)).toBe(
      verifyRegisterEmailPasscode
    );
    expect(getVerifyPasscodeApi(UserFlow.signIn, SignInIdentifier.Sms)).toBe(
      verifySignInSmsPasscode
    );
    expect(getVerifyPasscodeApi(UserFlow.signIn, SignInIdentifier.Email)).toBe(
      verifySignInEmailPasscode
    );
    expect(getVerifyPasscodeApi(UserFlow.forgotPassword, SignInIdentifier.Email)).toBe(
      verifyForgotPasswordEmailPasscode
    );
    expect(getVerifyPasscodeApi(UserFlow.forgotPassword, SignInIdentifier.Sms)).toBe(
      verifyForgotPasswordSmsPasscode
    );
  });
});
