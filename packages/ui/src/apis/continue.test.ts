import ky from 'ky';

import { continueApi } from './continue';

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
});
