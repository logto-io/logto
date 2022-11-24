import { SignInIdentifier } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { verifyUserPassword } from '#src/lib/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import verifyUserByPassword from './verify-user-by-password.js';

jest.mock('#src/lib/user.js', () => ({
  verifyUserPassword: jest.fn(),
}));

describe('verifyUserByPassword', () => {
  const findUser = jest.fn();
  const baseCtx = createContextWithRouteParameters();
  const verifyUserPasswordMock = verifyUserPassword as jest.Mock;
  const mockUser = { id: 'mock_user', isSuspended: false };

  it('should throw if target sign-in method is not enabled', async () => {
    const ctx = {
      ...baseCtx,
      interactionPayload: {},
      signInExperience: {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier === SignInIdentifier.Username
          ),
        },
      },
    };

    await expect(
      verifyUserByPassword(ctx, {
        identifier: 'foo',
        password: 'password',
        findUser,
        identifierType: SignInIdentifier.Email,
      })
    ).rejects.toThrow();
  });

  it('should return userId', async () => {
    findUser.mockResolvedValueOnce(mockUser);
    verifyUserPasswordMock.mockResolvedValueOnce(mockUser);

    const ctx = {
      ...baseCtx,
      interactionPayload: {},
      signInExperience: {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier === SignInIdentifier.Username
          ),
        },
      },
    };

    const userId = await verifyUserByPassword(ctx, {
      identifier: 'foo',
      password: 'password',
      findUser,
      identifierType: SignInIdentifier.Username,
    });

    expect(findUser).toBeCalledWith('foo');
    expect(verifyUserPasswordMock).toBeCalledWith(mockUser, 'password');
    expect(userId).toEqual(mockUser.id);
  });

  it('should reject if user is suspended', async () => {
    findUser.mockResolvedValueOnce(mockUser);
    verifyUserPasswordMock.mockResolvedValueOnce({
      ...mockUser,
      isSuspended: true,
    });

    const ctx = {
      ...baseCtx,
      interactionPayload: {},
      signInExperience: {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier === SignInIdentifier.Username
          ),
        },
      },
    };

    await expect(
      verifyUserByPassword(ctx, {
        identifier: 'foo',
        password: 'password',
        findUser,
        identifierType: SignInIdentifier.Username,
      })
    ).rejects.toThrow();

    expect(findUser).toBeCalledWith('foo');
    expect(verifyUserPasswordMock).toBeCalledWith(mockUser, 'password');
  });
});
