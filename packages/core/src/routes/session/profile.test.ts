import type { CreateUser, User } from '@logto/schemas';
import { SignUpIdentifier } from '@logto/schemas';
import { getUnixTime } from 'date-fns';
import { Provider } from 'oidc-provider';

import { mockUser, mockUserResponse } from '@/__mocks__';
import { createRequester } from '@/utils/test-utils';

import profileRoutes, { profileRoute } from './profile';

const mockFindUserById = jest.fn(async (): Promise<User> => mockUser);
const mockHasUser = jest.fn(async () => false);
const mockHasUserWithEmail = jest.fn(async () => false);
const mockHasUserWithPhone = jest.fn(async () => false);
const mockUpdateUserById = jest.fn(
  async (_, data: Partial<CreateUser>): Promise<User> => ({
    ...mockUser,
    ...data,
  })
);

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    Session: {
      get: jest.fn(async () => ({ accountId: 'id', loginTs: getUnixTime(new Date()) - 60 })),
    },
  })),
}));

jest.mock('@/queries/user', () => ({
  ...jest.requireActual('@/queries/user'),
  findUserById: async () => mockFindUserById(),
  hasUser: async () => mockHasUser(),
  hasUserWithEmail: async () => mockHasUserWithEmail(),
  hasUserWithPhone: async () => mockHasUserWithPhone(),
  updateUserById: async (id: string, data: Partial<CreateUser>) => mockUpdateUserById(id, data),
}));

const mockFindDefaultSignInExperience = jest.fn(async () => ({
  signUp: {
    identifier: SignUpIdentifier.None,
    password: false,
    verify: false,
  },
}));

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: jest.fn(async () => mockFindDefaultSignInExperience()),
}));

describe('session -> profileRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: profileRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  test('GET /session/profile should return current user data', async () => {
    const response = await sessionRequest.get(profileRoute);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(mockUserResponse);
  });

  describe('PATCH /session/profile/username', () => {
    it('should update username with the new value', async () => {
      const newUsername = 'charles';

      const response = await sessionRequest
        .patch(`${profileRoute}/username`)
        .send({ username: newUsername });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ ...mockUserResponse, username: newUsername });
    });

    it('should throw when username is already in use', async () => {
      mockHasUser.mockImplementationOnce(async () => true);

      const response = await sessionRequest
        .patch(`${profileRoute}/username`)
        .send({ username: 'test' });

      expect(response.statusCode).toEqual(422);
    });
  });
});
