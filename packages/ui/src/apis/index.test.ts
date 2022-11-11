import { PasscodeType } from '@logto/schemas';
import ky from 'ky';

import { consent } from './consent';
import {
  verifyForgotPasswordEmailPasscode,
  verifyForgotPasswordSmsPasscode,
  sendForgotPasswordEmailPasscode,
  sendForgotPasswordSmsPasscode,
  resetPassword,
} from './forgot-password';
import {
  register,
  checkUsername,
  registerWithSms,
  registerWithEmail,
  sendRegisterEmailPasscode,
  sendRegisterSmsPasscode,
  verifyRegisterEmailPasscode,
  verifyRegisterSmsPasscode,
} from './register';
import {
  signInWithUsername,
  signInWithSms,
  signInWithEmail,
  sendSignInSmsPasscode,
  sendSignInEmailPasscode,
  verifySignInEmailPasscode,
  verifySignInSmsPasscode,
  signInWithEmailPassword,
  signInWithPhonePassword,
} from './sign-in';
import {
  invokeSocialSignIn,
  signInWithSocial,
  bindSocialAccount,
  bindSocialRelatedUser,
  registerWithSocial,
} from './social';

jest.mock('ky', () => ({
  extend: () => ky,
  post: jest.fn(() => ({
    json: jest.fn(),
  })),
}));

describe('api', () => {
  const username = 'username';
  const password = 'password';
  const phone = '18888888';
  const code = '111111';
  const email = 'foo@logto.io';

  const mockKyPost = ky.post as jest.Mock;

  afterEach(() => {
    mockKyPost.mockClear();
  });

  it('signInWithUsername', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInWithUsername(username, password);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/password/username', {
      json: {
        username,
        password,
      },
    });
  });

  it('signInWithEmailPassword', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInWithEmailPassword(email, password);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/password/email', {
      json: {
        email,
        password,
      },
    });
  });

  it('signInWithEmailPassword with bind social account', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInWithEmailPassword(email, password, 'github');
    expect(ky.post).toHaveBeenNthCalledWith(1, '/api/session/sign-in/password/email', {
      json: {
        email,
        password,
      },
    });
    expect(ky.post).toHaveBeenNthCalledWith(2, '/api/session/bind-social', {
      json: {
        connectorId: 'github',
      },
    });
  });

  it('signInWithPhonePassword', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInWithPhonePassword(phone, password);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/password/sms', {
      json: {
        phone,
        password,
      },
    });
  });

  it('signInWithPhonePassword with bind social account', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInWithPhonePassword(phone, password, 'github');
    expect(ky.post).toHaveBeenNthCalledWith(1, '/api/session/sign-in/password/sms', {
      json: {
        phone,
        password,
      },
    });
    expect(ky.post).toHaveBeenNthCalledWith(2, '/api/session/bind-social', {
      json: {
        connectorId: 'github',
      },
    });
  });

  it('signInWithSms', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInWithSms();
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/sms');
  });

  it('signInWithEmail', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInWithEmail();
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/email');
  });

  it('signInWithUsername with bind social account', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInWithUsername(username, password, 'github');
    expect(ky.post).toHaveBeenNthCalledWith(1, '/api/session/sign-in/password/username', {
      json: {
        username,
        password,
      },
    });
    expect(ky.post).toHaveBeenNthCalledWith(2, '/api/session/bind-social', {
      json: {
        connectorId: 'github',
      },
    });
  });

  it('sendSignInSmsPasscode', async () => {
    await sendSignInSmsPasscode(phone);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/sms/send', {
      json: {
        phone,
        flow: PasscodeType.SignIn,
      },
    });
  });

  it('verifySignInSmsPasscode', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });

    await verifySignInSmsPasscode(phone, code);

    expect(ky.post).toBeCalledWith('/api/session/passwordless/sms/verify', {
      json: {
        phone,
        code,
        flow: PasscodeType.SignIn,
      },
    });
  });

  it('sendSignInEmailPasscode', async () => {
    await sendSignInEmailPasscode(email);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/email/send', {
      json: {
        email,
        flow: PasscodeType.SignIn,
      },
    });
  });

  it('verifySignInEmailPasscode', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });

    await verifySignInEmailPasscode(email, code);

    expect(ky.post).toBeCalledWith('/api/session/passwordless/email/verify', {
      json: {
        email,
        code,
        flow: PasscodeType.SignIn,
      },
    });
  });

  it('consent', async () => {
    await consent();
    expect(ky.post).toBeCalledWith('/api/session/consent');
  });

  it('register', async () => {
    await register(username, password);
    expect(ky.post).toBeCalledWith('/api/session/register/password/username', {
      json: {
        username,
        password,
      },
    });
  });

  it('checkUsername', async () => {
    await checkUsername(username);
    expect(ky.post).toBeCalledWith('/api/session/register/password/check-username', {
      json: {
        username,
      },
    });
  });

  it('registerWithSms', async () => {
    await registerWithSms();
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/sms');
  });

  it('registerWithEmail', async () => {
    await registerWithEmail();
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/email');
  });

  it('sendRegisterSmsPasscode', async () => {
    await sendRegisterSmsPasscode(phone);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/sms/send', {
      json: {
        phone,
        flow: PasscodeType.Register,
      },
    });
  });

  it('verifyRegisterSmsPasscode', async () => {
    await verifyRegisterSmsPasscode(phone, code);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/sms/verify', {
      json: {
        phone,
        code,
        flow: PasscodeType.Register,
      },
    });
  });

  it('sendRegisterEmailPasscode', async () => {
    await sendRegisterEmailPasscode(email);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/email/send', {
      json: {
        email,
        flow: PasscodeType.Register,
      },
    });
  });

  it('verifyRegisterEmailPasscode', async () => {
    await verifyRegisterEmailPasscode(email, code);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/email/verify', {
      json: {
        email,
        code,
        flow: PasscodeType.Register,
      },
    });
  });

  it('sendForgotPasswordSmsPasscode', async () => {
    await sendForgotPasswordSmsPasscode(phone);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/sms/send', {
      json: {
        phone,
        flow: PasscodeType.ForgotPassword,
      },
    });
  });

  it('verifyForgotPasswordSmsPasscode', async () => {
    await verifyForgotPasswordSmsPasscode(phone, code);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/sms/verify', {
      json: {
        phone,
        code,
        flow: PasscodeType.ForgotPassword,
      },
    });
  });

  it('sendForgotPasswordEmailPasscode', async () => {
    await sendForgotPasswordEmailPasscode(email);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/email/send', {
      json: {
        email,
        flow: PasscodeType.ForgotPassword,
      },
    });
  });

  it('verifyForgotPasswordEmailPasscode', async () => {
    await verifyForgotPasswordEmailPasscode(email, code);
    expect(ky.post).toBeCalledWith('/api/session/passwordless/email/verify', {
      json: {
        email,
        code,
        flow: PasscodeType.ForgotPassword,
      },
    });
  });

  it('invokeSocialSignIn', async () => {
    await invokeSocialSignIn('connectorId', 'state', 'redirectUri');
    expect(ky.post).toBeCalledWith('/api/session/sign-in/social', {
      json: {
        connectorId: 'connectorId',
        state: 'state',
        redirectUri: 'redirectUri',
      },
    });
  });

  it('signInWithSocial', async () => {
    const parameters = {
      connectorId: 'connectorId',
      data: {
        redirectUri: 'redirectUri',
        code: 'code',
      },
    };
    await signInWithSocial(parameters);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/social/auth', {
      json: parameters,
    });
  });

  it('bindSocialAccount', async () => {
    await bindSocialAccount('connectorId');
    expect(ky.post).toBeCalledWith('/api/session/bind-social', {
      json: {
        connectorId: 'connectorId',
      },
    });
  });

  it('bindSocialRelatedUser', async () => {
    await bindSocialRelatedUser('connectorId');
    expect(ky.post).toBeCalledWith('/api/session/sign-in/bind-social-related-user', {
      json: {
        connectorId: 'connectorId',
      },
    });
  });

  it('registerWithSocial', async () => {
    await registerWithSocial('connectorId');
    expect(ky.post).toBeCalledWith('/api/session/register/social', {
      json: {
        connectorId: 'connectorId',
      },
    });
  });

  it('resetPassword', async () => {
    await resetPassword('password');
    expect(ky.post).toBeCalledWith('/api/session/forgot-password/reset', {
      json: {
        password: 'password',
      },
    });
  });
});
