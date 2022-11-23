import { SignInIdentifier } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { findUserByUsername, findUserByEmail, findUserByPhone } from '#src/queries/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { verifyUserByPassword } from '../utils/index.js';
import identifierVerification from './identifier-verification.js';

jest.mock('../utils/index.js', () => ({
  verifyUserByPassword: jest.fn(),
}));

describe('identifier verification', () => {
  const baseCtx = createContextWithRouteParameters();
  const verifyUserByPasswordMock = verifyUserByPassword as jest.Mock;

  it('username password', async () => {
    verifyUserByPasswordMock.mockResolvedValueOnce('userId');

    const ctx = {
      ...baseCtx,
      signInExperience: mockSignInExperience,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier: {
          username: 'username',
          password: 'password',
        },
      }),
    };

    const result = await identifierVerification(ctx);

    expect(verifyUserByPasswordMock).toBeCalledWith(ctx, {
      findUser: findUserByUsername,
      identifier: 'username',
      identifierType: SignInIdentifier.Username,
      password: 'password',
    });
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });

  it('email password', async () => {
    verifyUserByPasswordMock.mockResolvedValueOnce('userId');

    const ctx = {
      ...baseCtx,
      signInExperience: mockSignInExperience,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier: {
          email: 'email',
          password: 'password',
        },
      }),
    };

    const result = await identifierVerification(ctx);

    expect(verifyUserByPasswordMock).toBeCalledWith(ctx, {
      findUser: findUserByEmail,
      identifier: 'email',
      identifierType: SignInIdentifier.Email,
      password: 'password',
    });
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });

  it('phone password', async () => {
    verifyUserByPasswordMock.mockResolvedValueOnce('userId');

    const ctx = {
      ...baseCtx,
      signInExperience: mockSignInExperience,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier: {
          phone: '123456',
          password: 'password',
        },
      }),
    };

    const result = await identifierVerification(ctx);

    expect(verifyUserByPasswordMock).toBeCalledWith(ctx, {
      findUser: findUserByPhone,
      identifier: '123456',
      identifierType: SignInIdentifier.Sms,
      password: 'password',
    });
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });
});
