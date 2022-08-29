import ky from 'ky';

import { consent } from './consent';
import {
  register,
  sendRegisterEmailPasscode,
  sendRegisterSmsPasscode,
  verifyRegisterEmailPasscode,
  verifyRegisterSmsPasscode,
} from './register';
import {
  signInBasic,
  sendSignInSmsPasscode,
  sendSignInEmailPasscode,
  verifySignInEmailPasscode,
  verifySignInSmsPasscode,
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

  it('signInBasic', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInBasic(username, password);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/username-password', {
      json: {
        username,
        password,
      },
    });
  });

  it('signInBasic with bind social account', async () => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
    await signInBasic(username, password, 'github');
    expect(ky.post).toHaveBeenNthCalledWith(1, '/api/session/sign-in/username-password', {
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
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/sms/send-passcode', {
      json: {
        phone,
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
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/sms/verify-passcode', {
      json: {
        phone,
        code,
      },
    });
  });

  it('sendSignInEmailPasscode', async () => {
    await sendSignInEmailPasscode(email);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/email/send-passcode', {
      json: {
        email,
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
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/email/verify-passcode', {
      json: {
        email,
        code,
      },
    });
  });

  it('consent', async () => {
    await consent();
    expect(ky.post).toBeCalledWith('/api/session/consent');
  });

  it('register', async () => {
    await register(username, password);
    expect(ky.post).toBeCalledWith('/api/session/register/username-password', {
      json: {
        username,
        password,
      },
    });
  });

  it('sendRegisterSmsPasscode', async () => {
    await sendRegisterSmsPasscode(phone);
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/sms/send-passcode', {
      json: {
        phone,
      },
    });
  });

  it('verifyRegisterSmsPasscode', async () => {
    await verifyRegisterSmsPasscode(phone, code);
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/sms/verify-passcode', {
      json: {
        phone,
        code,
      },
    });
  });

  it('sendRegisterEmailPasscode', async () => {
    await sendRegisterEmailPasscode(email);
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/email/send-passcode', {
      json: {
        email,
      },
    });
  });

  it('verifyRegisterEmailPasscode', async () => {
    await verifyRegisterEmailPasscode(email, code);
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/email/verify-passcode', {
      json: {
        email,
        code,
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
});
