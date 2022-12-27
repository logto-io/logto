import { MessageTypes } from '@logto/connector-kit';
import ky from 'ky';

import {
  continueApi,
  sendContinueSetEmailPasscode,
  sendContinueSetPhonePasscode,
  verifyContinueSetEmailPasscode,
  verifyContinueSetSmsPasscode,
} from './continue';

jest.mock('ky', () => ({
  extend: () => ky,
  post: jest.fn(() => ({
    json: jest.fn(),
  })),
}));

describe('continue API', () => {
  const mockKyPost = ky.post as jest.Mock;

  beforeEach(() => {
    mockKyPost.mockReturnValueOnce({
      json: () => ({
        redirectTo: '/',
      }),
    });
  });

  afterEach(() => {
    mockKyPost.mockClear();
  });

  it('continue with password', async () => {
    await continueApi('password', 'password');
    expect(ky.post).toBeCalledWith('/api/session/sign-in/continue/password', {
      json: {
        password: 'password',
      },
    });
  });

  it('continue with username', async () => {
    await continueApi('username', 'username');
    expect(ky.post).toBeCalledWith('/api/session/sign-in/continue/username', {
      json: {
        username: 'username',
      },
    });
  });

  it('continue with email', async () => {
    await continueApi('email', 'email');

    expect(ky.post).toBeCalledWith('/api/session/sign-in/continue/email', {
      json: {
        email: 'email',
      },
    });
  });

  it('continue with phone', async () => {
    await continueApi('phone', 'phone');

    expect(ky.post).toBeCalledWith('/api/session/sign-in/continue/sms', {
      json: {
        phone: 'phone',
      },
    });
  });

  it('sendContinueSetEmailPasscode', async () => {
    await sendContinueSetEmailPasscode('email');

    expect(ky.post).toBeCalledWith('/api/session/passwordless/email/send', {
      json: {
        email: 'email',
        flow: MessageTypes.Continue,
      },
    });
  });

  it('sendContinueSetSmsPasscode', async () => {
    await sendContinueSetPhonePasscode('111111');

    expect(ky.post).toBeCalledWith('/api/session/passwordless/sms/send', {
      json: {
        phone: '111111',
        flow: MessageTypes.Continue,
      },
    });
  });

  it('verifyContinueSetEmailPasscode', async () => {
    await verifyContinueSetEmailPasscode('email', 'passcode');

    expect(ky.post).toBeCalledWith('/api/session/passwordless/email/verify', {
      json: {
        email: 'email',
        code: 'passcode',
        flow: MessageTypes.Continue,
      },
    });
  });

  it('verifyContinueSetSmsPasscode', async () => {
    await verifyContinueSetSmsPasscode('phone', 'passcode');

    expect(ky.post).toBeCalledWith('/api/session/passwordless/sms/verify', {
      json: {
        phone: 'phone',
        code: 'passcode',
        flow: MessageTypes.Continue,
      },
    });
  });
});
