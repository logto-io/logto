import ky from 'ky';

import { consent } from './consent';
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
  const phone = '18888888';
  const code = '111111';
  const email = 'foo@logto.io';

  const mockKyPost = ky.post as jest.Mock;

  afterEach(() => {
    mockKyPost.mockClear();
  });

  it('consent', async () => {
    await consent();
    expect(ky.post).toBeCalledWith('/api/session/consent');
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
