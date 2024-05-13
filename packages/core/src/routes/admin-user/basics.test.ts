import type { CreateUser, Role, SignInExperience, User } from '@logto/schemas';
import { RoleType, UsersPasswordEncryptionMethod } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { removeUndefinedKeys } from '@silverhand/essentials';

import { mockUser, mockUserResponse } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const mockedQueries = {
  signInExperiences: {
    findDefaultSignInExperience: jest.fn(
      async () =>
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ({
          signUp: {
            identifiers: [],
            password: false,
            verify: false,
          },
        }) as SignInExperience
    ),
  },
  users: {
    findUserById: jest.fn(async (id: string) => mockUser),
    hasUser: jest.fn(async () => mockHasUser()),
    hasUserWithEmail: jest.fn(async () => mockHasUserWithEmail()),
    hasUserWithPhone: jest.fn(async () => mockHasUserWithPhone()),
    updateUserById: jest.fn(
      async (_, data: Partial<CreateUser>): Promise<User> => ({
        ...mockUser,
        ...data,
      })
    ),
    deleteUserById: jest.fn(),
    deleteUserIdentity: jest.fn(),
  },
  roles: {
    findRolesByRoleNames: jest.fn(
      async (): Promise<Role[]> => [
        {
          tenantId: 'fake_tenant',
          id: 'role_id',
          name: 'admin',
          description: 'none',
          type: RoleType.User,
        },
      ]
    ),
  },
  usersRoles: {
    deleteUsersRolesByUserIdAndRoleId: jest.fn(),
  },
} satisfies Partial2<Queries>;

const mockHasUser = jest.fn(async () => false);
const mockHasUserWithEmail = jest.fn(async () => false);
const mockHasUserWithPhone = jest.fn(async () => false);

const { hasUser, findUserById, updateUserById, deleteUserIdentity, deleteUserById } =
  mockedQueries.users;

const { encryptUserPassword } = await mockEsmWithActual('#src/libraries/user.js', () => ({
  encryptUserPassword: jest.fn(() => ({
    passwordEncrypted: 'password',
    passwordEncryptionMethod: 'Argon2i',
  })),
}));

const verifyUserPassword = jest.fn();
const signOutUser = jest.fn();
const usersLibraries = {
  generateUserId: jest.fn(async () => 'fooId'),
  insertUser: jest.fn(
    async (user: CreateUser): Promise<User> => ({
      ...mockUser,
      ...removeUndefinedKeys(user), // No undefined values will be returned from database
    })
  ),
  verifyUserPassword,
  signOutUser,
} satisfies Partial<Libraries['users']>;

const adminUserRoutes = await pickDefault(import('./basics.js'));

describe('adminUserRoutes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, undefined, {
    users: usersLibraries,
  });
  const userRequest = createRequester({ authedRoutes: adminUserRoutes, tenantContext });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users/:userId', async () => {
    const response = await userRequest.get('/users/foo');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockUserResponse);
  });

  it('POST /users', async () => {
    const username = 'MJAtLogto';
    const password = 'PASSWORD1234';
    const name = 'Michael';
    const { primaryEmail, primaryPhone } = mockUser;

    const response = await userRequest
      .post('/users')
      .send({ primaryEmail, primaryPhone, username, password, name });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockUserResponse,
      id: 'fooId',
      username,
      name,
    });
  });

  it('POST /users should be ok with simple passwords', async () => {
    const username = 'MJAtLogto';
    const name = 'Michael';

    // Invalid input format
    await expect(
      userRequest.post('/users').send({ username, password: 'abc', name })
    ).resolves.toHaveProperty('status', 200);
  });

  it('POST /users with password digest', async () => {
    const username = 'MJAtLogto';
    const name = 'Michael';

    await expect(
      userRequest.post('/users').send({
        username,
        name,
        passwordDigest: '5f4dcc3b5aa765d61d8327deb882cf99',
        passwordAlgorithm: UsersPasswordEncryptionMethod.MD5,
      })
    ).resolves.toHaveProperty('status', 200);
  });

  it('POST /users should throw if username exists', async () => {
    const mockHasUser = hasUser as jest.Mock;
    mockHasUser.mockImplementationOnce(async () => true);

    const username = 'MJAtLogto';
    const password = 'PASSWORD1234';
    const name = 'Michael';

    await expect(
      userRequest.post('/users').send({ username, password, name })
    ).resolves.toHaveProperty('status', 422);
  });

  it('PATCH /users/:userId', async () => {
    const name = 'Michael';
    const avatar = 'http://www.michael.png';
    const primaryEmail = 'bar@logto.io';
    const primaryPhone = '222222';
    const username = 'bar';

    const response = await userRequest
      .patch('/users/foo')
      .send({ username, name, avatar, primaryEmail, primaryPhone });

    expect(response.status).toEqual(200);
    expect(updateUserById).toHaveBeenCalledWith(
      'foo',
      {
        primaryEmail,
        primaryPhone,
        username,
        name,
        avatar,
      },
      expect.anything()
    );
  });

  it('PATCH /users/:userId should allow empty string for clearable fields', async () => {
    const response = await userRequest
      .patch('/users/foo')
      .send({ name: '', avatar: '', primaryEmail: '' });
    expect(response.status).toEqual(200);
    expect(updateUserById).toHaveBeenCalledWith(
      'foo',
      {
        name: '',
        avatar: '',
        primaryEmail: '',
      },
      expect.anything()
    );
  });

  it('PATCH /users/:userId should allow null values for clearable fields', async () => {
    const response = await userRequest
      .patch('/users/foo')
      .send({ name: null, username: null, primaryPhone: null });
    expect(response.status).toEqual(200);
    expect(updateUserById).toHaveBeenCalledWith(
      'foo',
      {
        name: null,
        username: null,
        primaryPhone: null,
      },
      expect.anything()
    );
  });

  it('PATCH /users/:userId should allow partial update', async () => {
    const name = 'Michael';

    const updateNameResponse = await userRequest.patch('/users/foo').send({ name });
    expect(updateNameResponse.status).toEqual(200);
    expect(updateUserById).toHaveBeenCalledWith(
      'foo',
      {
        name,
      },
      expect.anything()
    );

    const avatar = 'https://www.michael.png';
    const updateAvatarResponse = await userRequest.patch('/users/foo').send({ avatar });
    expect(updateAvatarResponse.status).toEqual(200);
    expect(updateUserById).toHaveBeenCalledWith(
      'foo',
      {
        avatar,
      },
      expect.anything()
    );
  });

  it('PATCH /users/:userId should throw when avatar URL is invalid', async () => {
    const name = 'Michael';
    const avatar = 'http://www.michael.png';

    await expect(userRequest.patch('/users/foo').send({ avatar })).resolves.toHaveProperty(
      'status',
      200
    );

    await expect(
      userRequest.patch('/users/foo').send({ name, avatar: 'non url' })
    ).resolves.toHaveProperty('status', 400);
  });

  it('PATCH /users/:userId should throw if user cannot be found', async () => {
    const name = 'Michael';
    const avatar = 'http://www.michael.png';

    findUserById.mockImplementationOnce(() => {
      throw new Error(' ');
    });

    await expect(userRequest.patch('/users/foo').send({ name, avatar })).resolves.toHaveProperty(
      'status',
      500
    );
    expect(updateUserById).not.toBeCalled();
  });

  it('PATCH /users/:userId should throw if new username is already in use', async () => {
    mockHasUser.mockImplementationOnce(async () => true);

    await expect(
      userRequest.patch('/users/foo').send({ username: 'test' })
    ).resolves.toHaveProperty('status', 422);
  });

  it('PATCH /users/:userId should throw if new email has already linked to other accounts', async () => {
    mockHasUserWithEmail.mockImplementationOnce(async () => true);

    await expect(
      userRequest.patch('/users/foo').send({ primaryEmail: 'test@email.com' })
    ).resolves.toHaveProperty('status', 422);
  });

  it('PATCH /users/:userId should throw if new phone number has already linked to other accounts', async () => {
    mockHasUserWithPhone.mockImplementationOnce(async () => true);

    await expect(
      userRequest.patch('/users/foo').send({ primaryPhone: '18688886666' })
    ).resolves.toHaveProperty('status', 422);
  });

  it('PATCH /users/:userId/password', async () => {
    const mockedUserId = 'foo';
    const password = '1234asd$';
    const response = await userRequest.patch(`/users/${mockedUserId}/password`).send({ password });
    expect(encryptUserPassword).toHaveBeenCalledWith(password);
    expect(findUserById).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockUserResponse,
    });
  });

  it('PATCH /users/:userId/password should throw if user cannot be found', async () => {
    const notExistedUserId = 'notExistedUserId';
    const dummyPassword = '1234asd$';

    findUserById.mockImplementationOnce(async (userId) => {
      if (userId === notExistedUserId) {
        throw new Error(' ');
      }

      return mockUser;
    });

    await expect(
      userRequest.patch(`/users/${notExistedUserId}/password`).send({ password: dummyPassword })
    ).resolves.toHaveProperty('status', 500);
    expect(encryptUserPassword).not.toHaveBeenCalled();
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('POST /users/:userId/password/verify', async () => {
    const mockedUserId = 'foo';
    const password = '1234asd$';
    const response = await userRequest
      .post(`/users/${mockedUserId}/password/verify`)
      .send({ password });

    expect(findUserById).toHaveBeenCalledWith(mockedUserId);
    expect(verifyUserPassword).toHaveBeenCalledWith(mockUser, password);
    expect(response.status).toEqual(204);
  });

  it('POST /users/:userId/password/verify should throw 400 if password is empty', async () => {
    const password = '';
    await expect(
      userRequest.post(`/users/foo/password/verify`).send({ password })
    ).resolves.toHaveProperty('status', 400);
    expect(verifyUserPassword).not.toHaveBeenCalled();
  });

  it('POST /users/:userId/password/verify should throw if password is invalid', async () => {
    const password = 'invalidPassword';
    verifyUserPassword.mockImplementationOnce(async () => {
      throw new RequestError({ code: 'session.invalid_credentials', status: 422 });
    });
    await expect(
      userRequest.post(`/users/foo/password/verify`).send({ password })
    ).resolves.toHaveProperty('status', 422);
    expect(verifyUserPassword).toHaveBeenCalledWith(mockUser, password);
  });

  it('GET /users/:userId/has-password should return true if user has password', async () => {
    const response = await userRequest.get(`/users/foo/has-password`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ hasPassword: true });
  });

  it('GET /users/:userId/has-password should return false if user does not have password', async () => {
    findUserById.mockImplementationOnce(async () => ({ ...mockUser, passwordEncrypted: null }));
    const response = await userRequest.get(`/users/foo/has-password`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ hasPassword: false });
  });

  it('PATCH /users/:userId/is-suspended', async () => {
    const mockedUserId = 'foo';
    const response = await userRequest
      .patch(`/users/${mockedUserId}/is-suspended`)
      .send({ isSuspended: true });
    expect(updateUserById).toHaveBeenCalledWith(mockedUserId, { isSuspended: true });
    expect(signOutUser).toHaveBeenCalledWith(mockedUserId);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockUserResponse,
      isSuspended: true,
    });
  });

  it('DELETE /users/:userId', async () => {
    const userId = 'fooUser';
    const response = await userRequest.delete(`/users/${userId}`);
    expect(response.status).toEqual(204);
    expect(signOutUser).toHaveBeenCalledWith(userId);
  });

  it('DELETE /users/:userId should throw if user is deleting self', async () => {
    const userId = 'foo';
    const response = await userRequest.delete(`/users/${userId}`);
    expect(response.status).toEqual(400);
    expect(deleteUserIdentity).not.toHaveBeenCalled();
  });

  it('DELETE /users/:userId should throw if user cannot be found', async () => {
    const notExistedUserId = 'notExistedUserId';

    deleteUserById.mockImplementationOnce((userId) => {
      if (userId === notExistedUserId) {
        throw new Error(' ');
      }
    });

    await expect(userRequest.delete(`/users/${notExistedUserId}`)).resolves.toHaveProperty(
      'status',
      500
    );
  });
});
