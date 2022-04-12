import ky from 'ky';

import { consent } from './consent';
import {
  register,
  sendEmailPasscode as registerSendEmailPasscode,
  sendPhonePasscode as registerSendPhonePasscode,
  verifyEmailPasscode as registerVerifyEmailPasscode,
  verifyPhonePasscode as registerVerifyPhonePasscode,
} from './register';
import {
  signInBasic,
  sendPhonePasscode,
  sendEmailPasscode,
  verifyEmailPasscode,
  verifyPhonePasscode,
} from './sign-in';
import {
  invokeSocialSignIn,
  signInWithSoical,
  bindSocialAccount,
  registerWithSocial,
} from './social';

jest.mock('ky', () => ({
  post: jest.fn(() => ({
    json: jest.fn(),
  })),
}));

describe('api', () => {
  const username = 'username';
  const password = 'password';
  const phone = '18888888';
  const passcode = '111111';
  const email = 'foo@logto.io';

  const mockKyPost = ky.post as jest.Mock;

  afterEach(() => {
    mockKyPost.mockClear();
  });

  it('signInBasic', async () => {
    await signInBasic(username, password);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/username-password', {
      json: {
        username,
        password,
      },
    });
  });

  it('sendPhonePasscode', async () => {
    await sendPhonePasscode(phone);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/phone/send-passcode', {
      json: {
        phone,
      },
    });
  });

  it('verifyPhonePasscode', async () => {
    await verifyPhonePasscode(phone, passcode);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/phone/verify-passcode', {
      json: {
        phone,
        passcode,
      },
    });
  });

  it('sendEmailPasscode', async () => {
    await sendEmailPasscode(email);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/email/send-passcode', {
      json: {
        email,
      },
    });
  });

  it('verifyEmailPasscode', async () => {
    await verifyEmailPasscode(email, passcode);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/passwordless/email/verify-passcode', {
      json: {
        email,
        passcode,
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

  it('registerSendPhonePasscode', async () => {
    await registerSendPhonePasscode(phone);
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/phone/send-passcode', {
      json: {
        phone,
      },
    });
  });

  it('registerVerifyPhonePasscode', async () => {
    await registerVerifyPhonePasscode(phone, passcode);
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/phone/verify-passcode', {
      json: {
        phone,
        passcode,
      },
    });
  });

  it('registerSendEmailPasscode', async () => {
    await registerSendEmailPasscode(email);
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/email/send-passcode', {
      json: {
        email,
      },
    });
  });

  it('registerVerifyEmailPasscode', async () => {
    await registerVerifyEmailPasscode(email, passcode);
    expect(ky.post).toBeCalledWith('/api/session/register/passwordless/email/verify-passcode', {
      json: {
        email,
        passcode,
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

  it('signInWithSoical', async () => {
    const parameters = {
      connectorId: 'connectorId',
      state: 'state',
      redirectUri: 'redirectUri',
      code: 'code',
    };
    await signInWithSoical(parameters);
    expect(ky.post).toBeCalledWith('/api/session/sign-in/social', {
      json: parameters,
    });
  });

  it('bindSocialAccount', async () => {
    await bindSocialAccount('connectorId');
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
