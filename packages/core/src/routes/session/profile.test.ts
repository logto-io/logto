import type { CreateUser, User } from '@logto/schemas';
import { SignUpIdentifier } from '@logto/schemas';
import { getUnixTime } from 'date-fns';
import { Provider } from 'oidc-provider';

import { mockPasswordEncrypted, mockUser, mockUserResponse } from '@/__mocks__';
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
const encryptUserPassword = jest.fn(async (password: string) => ({
  passwordEncrypted: password + '_user1',
  passwordEncryptionMethod: 'Argon2i',
}));
const mockArgon2Verify = jest.fn(async (password: string) => password === mockPasswordEncrypted);

const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({
  result: { login: { accountId: 'id', ts: getUnixTime(new Date()) - 60 } },
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    Session: {
      get: jest.fn(async () => ({ accountId: 'id', loginTs: getUnixTime(new Date()) - 60 })),
    },
  })),
}));

jest.mock('@/lib/user', () => ({
  ...jest.requireActual('@/lib/user'),
  encryptUserPassword: async (password: string) => encryptUserPassword(password),
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

jest.mock('hash-wasm', () => ({
  argon2Verify: async (password: string) => mockArgon2Verify(password),
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

  describe('POST /session/profile/password', () => {
    it('should update password with the new value', async () => {
      const response = await sessionRequest
        .post(`${profileRoute}/password`)
        .send({ password: mockPasswordEncrypted });

      expect(mockUpdateUserById).toBeCalledWith(
        'id',
        expect.objectContaining({
          passwordEncrypted: 'a1b2c3_user1',
          passwordEncryptionMethod: 'Argon2i',
        })
      );
      expect(response.statusCode).toEqual(204);
    });

    it('should throw if new password is identical to old password', async () => {
      jest.clearAllMocks();
      encryptUserPassword.mockImplementationOnce(async (password: string) => ({
        passwordEncrypted: password,
        passwordEncryptionMethod: 'Argon2i',
      }));
      mockArgon2Verify.mockResolvedValueOnce(true);

      const response = await sessionRequest
        .post(`${profileRoute}/password`)
        .send({ password: 'password' });

      expect(response.statusCode).toEqual(422);
      expect(mockUpdateUserById).not.toBeCalled();
    });
  });
});
