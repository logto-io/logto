import type { CreateUser, Role, SignInExperience, User } from '@logto/schemas';
import { userInfoSelectFields } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { pick } from '@silverhand/essentials';

import {
  mockUser,
  mockUserList,
  mockUserListResponse,
  mockUserResponse,
} from '#src/__mocks__/index.js';
import Libraries from '#src/tenants/Libraries.js';
import Queries from '#src/tenants/Queries.js';
import { MockTenant, Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const filterUsersWithSearch = (users: User[], search: string) =>
  users.filter((user) =>
    [user.username, user.primaryEmail, user.primaryPhone, user.name].some((value) =>
      value ? !value.includes(search) : false
    )
  );

const mockedQueries = {
  oidcModelInstances: { revokeInstanceByUserId: jest.fn() },
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
        } as SignInExperience)
    ),
  },
  users: {
    countUsers: jest.fn(async (search) => ({
      count: search
        ? filterUsersWithSearch(mockUserList, String(search)).length
        : mockUserList.length,
    })),
    findUsers: jest.fn(
      async (limit, offset, search): Promise<User[]> =>
        // For testing, type should be `Search` but we use `string` in `filterUsersWithSearch()` here
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        search ? filterUsersWithSearch(mockUserList, String(search)) : mockUserList
    ),
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
      async (): Promise<Role[]> => [{ id: 'role_id', name: 'admin', description: 'none' }]
    ),
  },
} satisfies Partial2<Queries>;

const mockHasUser = jest.fn(async () => false);
const mockHasUserWithEmail = jest.fn(async () => false);
const mockHasUserWithPhone = jest.fn(async () => false);

const { revokeInstanceByUserId } = mockedQueries.oidcModelInstances;
const { hasUser, findUserById, updateUserById, deleteUserIdentity, deleteUserById } =
  mockedQueries.users;
const { findRolesByRoleNames } = mockedQueries.roles;

const { encryptUserPassword } = await mockEsmWithActual('#src/libraries/user.js', () => ({
  encryptUserPassword: jest.fn(() => ({
    passwordEncrypted: 'password',
    passwordEncryptionMethod: 'Argon2i',
  })),
}));

const usersLibraries = {
  generateUserId: jest.fn(async () => 'fooId'),
  insertUser: jest.fn(
    async (user: CreateUser): Promise<User> => ({
      ...mockUser,
      ...user,
    })
  ),
} satisfies Partial<Libraries['users']>;

const adminUserRoutes = await pickDefault(import('./admin-user.js'));

describe('adminUserRoutes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, { users: usersLibraries });
  const userRequest = createRequester({ authedRoutes: adminUserRoutes, tenantContext });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users', async () => {
    const response = await userRequest.get('/users');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockUserListResponse);
    expect(response.header).toHaveProperty('total-number', `${mockUserList.length}`);
  });

  it('GET /users should return matched data', async () => {
    const search = 'foo';
    const response = await userRequest.get('/users').send({ search });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      filterUsersWithSearch(mockUserList, search).map((user) => pick(user, ...userInfoSelectFields))
    );
    expect(response.header).toHaveProperty(
      'total-number',
      `${filterUsersWithSearch(mockUserList, search).length}`
    );
  });

  it('GET /users/:userId', async () => {
    const response = await userRequest.get('/users/foo');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ ...mockUserResponse, roleNames: ['admin'] });
  });

  it('POST /users', async () => {
    const username = 'MJAtLogto';
    const password = 'PASSWORD';
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
      roleNames: undefined, // API will call `insertUser()` with `roleNames` specified
    });
  });

  it('POST /users should throw with invalid input params', async () => {
    const username = 'MJAtLogto';
    const name = 'Michael';

    // Invalid input format
    await expect(
      userRequest.post('/users').send({ username, password: 'abc', name })
    ).resolves.toHaveProperty('status', 400);
  });

  it('POST /users should throw if username exists', async () => {
    const mockHasUser = hasUser as jest.Mock;
    mockHasUser.mockImplementationOnce(async () => true);

    const username = 'MJAtLogto';
    const password = 'PASSWORD';
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

  it('PATCH /users/:userId should throw if role names are invalid', async () => {
    findRolesByRoleNames.mockImplementationOnce(
      async (): Promise<Role[]> => [
        { id: 'role_id1', name: 'worker', description: 'none' },
        { id: 'role_id2', name: 'cleaner', description: 'none' },
      ]
    );
    await expect(
      userRequest.patch('/users/foo').send({ roleNames: ['superadmin'] })
    ).resolves.toHaveProperty('status', 400);
    expect(findUserById).toHaveBeenCalledTimes(1);
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('PATCH /users/:userId should update if roleNames field is an empty array', async () => {
    const roleNames: string[] = [];

    const response = await userRequest.patch('/users/foo').send({ roleNames });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockUserResponse);
  });

  it('PATCH /users/:userId/password', async () => {
    const mockedUserId = 'foo';
    const password = '123456';
    const response = await userRequest.patch(`/users/${mockedUserId}/password`).send({ password });
    expect(encryptUserPassword).toHaveBeenCalledWith(password);
    expect(updateUserById).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockUserResponse,
    });
  });

  it('PATCH /users/:userId/password should throw if user cannot be found', async () => {
    const notExistedUserId = 'notExistedUserId';
    const dummyPassword = '123456';

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

  it('PATCH /users/:userId/is-suspended', async () => {
    const mockedUserId = 'foo';
    const response = await userRequest
      .patch(`/users/${mockedUserId}/is-suspended`)
      .send({ isSuspended: true });
    expect(updateUserById).toHaveBeenCalledWith(mockedUserId, { isSuspended: true });
    expect(revokeInstanceByUserId).toHaveBeenCalledWith('refreshToken', mockedUserId);
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
  });

  it('DELETE /users/:userId should throw if user is deleting self', async () => {
    const userId = 'foo';
    const response = await userRequest.delete(`/users/${userId}`);
    expect(response.status).toEqual(400);
    expect(deleteUserIdentity).not.toHaveBeenCalled();
  });

  it('DELETE /users/:userId should throw if user cannot be found', async () => {
    const notExistedUserId = 'notExistedUserId';
    const mockedFindUserById = findUserById as jest.Mock;
    mockedFindUserById.mockImplementationOnce((userId) => {
      if (userId === notExistedUserId) {
        throw new Error(' ');
      }
    });
    await expect(userRequest.delete(`/users/${notExistedUserId}`)).resolves.toHaveProperty(
      'status',
      500
    );
    expect(deleteUserById).not.toHaveBeenCalled();
  });

  it('DELETE /users/:userId/identities/:target should throw if user cannot be found', async () => {
    const notExistedUserId = 'notExistedUserId';
    const arbitraryTarget = 'arbitraryTarget';
    const mockedFindUserById = findUserById as jest.Mock;
    mockedFindUserById.mockImplementationOnce((userId) => {
      if (userId === notExistedUserId) {
        throw new Error(' ');
      }
    });
    await expect(
      userRequest.delete(`/users/${notExistedUserId}/identities/${arbitraryTarget}`)
    ).resolves.toHaveProperty('status', 500);
    expect(deleteUserIdentity).not.toHaveBeenCalled();
  });

  it('DELETE /users/:userId/identities/:target should throw if user is found but connector cannot be found', async () => {
    const arbitraryUserId = 'arbitraryUserId';
    const nonExistedTarget = 'nonExistedTarget';
    const mockedFindUserById = findUserById as jest.Mock;
    mockedFindUserById.mockImplementationOnce((userId) => {
      if (userId === arbitraryUserId) {
        return { identities: { connector1: {}, connector2: {} } };
      }
    });
    await expect(
      userRequest.delete(`/users/${arbitraryUserId}/identities/${nonExistedTarget}`)
    ).resolves.toHaveProperty('status', 404);
    expect(deleteUserIdentity).not.toHaveBeenCalled();
  });

  it('DELETE /users/:userId/identities/:target', async () => {
    const arbitraryUserId = 'arbitraryUserId';
    const arbitraryTarget = 'arbitraryTarget';
    const mockedFindUserById = findUserById as jest.Mock;
    mockedFindUserById.mockImplementationOnce((userId) => {
      if (userId === arbitraryUserId) {
        return { identities: { connectorTarget1: {}, connectorTarget2: {}, arbitraryTarget: {} } };
      }
    });
    await userRequest.delete(`/users/${arbitraryUserId}/identities/${arbitraryTarget}`);
    expect(deleteUserIdentity).toHaveBeenCalledWith(arbitraryUserId, arbitraryTarget);
  });
});
