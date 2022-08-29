import { CreateUser, Role, User, userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';

import { mockUser, mockUserList, mockUserListResponse, mockUserResponse } from '@/__mocks__';
import { encryptUserPassword } from '@/lib/user';
import { findRolesByRoleNames } from '@/queries/roles';
import {
  hasUser,
  findUserById,
  updateUserById,
  deleteUserIdentity,
  deleteUserById,
} from '@/queries/user';
import { createRequester } from '@/utils/test-utils';

import adminUserRoutes from './admin-user';

const filterUsersWithSearch = (users: User[], search: string) =>
  users.filter((user) =>
    [user.username, user.primaryEmail, user.primaryPhone, user.name].some((value) =>
      value ? !value.includes(search) : false
    )
  );

jest.mock('@/queries/user', () => ({
  countUsers: jest.fn(async (search) => ({
    count: search ? filterUsersWithSearch(mockUserList, search).length : mockUserList.length,
  })),
  findUsers: jest.fn(
    async (limit, offset, search): Promise<User[]> =>
      search ? filterUsersWithSearch(mockUserList, search) : mockUserList
  ),
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  hasUser: jest.fn(async () => false),
  updateUserById: jest.fn(
    async (_, data: Partial<CreateUser>): Promise<User> => ({
      ...mockUser,
      ...data,
    })
  ),
  deleteUserById: jest.fn(),
  deleteUserIdentity: jest.fn(),
}));

jest.mock('@/lib/user', () => ({
  generateUserId: jest.fn(() => 'fooId'),
  encryptUserPassword: jest.fn(() => ({
    passwordEncrypted: 'password',
    passwordEncryptionMethod: 'Argon2i',
  })),
  insertUser: jest.fn(
    async (user: CreateUser): Promise<User> => ({
      ...mockUser,
      ...user,
    })
  ),
}));

jest.mock('@/queries/roles', () => ({
  findRolesByRoleNames: jest.fn(
    async (): Promise<Role[]> => [{ name: 'admin', description: 'none' }]
  ),
}));

describe('adminUserRoutes', () => {
  const userRequest = createRequester({ authedRoutes: adminUserRoutes });

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
    expect(response.body).toEqual(mockUserResponse);
  });

  it('POST /users', async () => {
    const username = 'MJAtLogto';
    const password = 'PASSWORD';
    const name = 'Micheal';

    const response = await userRequest.post('/users').send({ username, password, name });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockUserResponse,
      id: 'fooId',
      username,
      name,
    });
  });

  it('POST /users should throw with invalid input params', async () => {
    const username = 'MJAtLogto';
    const password = 'PASSWORD';
    const name = 'Micheal';

    // Missing input
    await expect(userRequest.post('/users').send({})).resolves.toHaveProperty('status', 400);
    await expect(userRequest.post('/users').send({ username, password })).resolves.toHaveProperty(
      'status',
      400
    );
    await expect(userRequest.post('/users').send({ username, name })).resolves.toHaveProperty(
      'status',
      400
    );
    await expect(userRequest.post('/users').send({ password, name })).resolves.toHaveProperty(
      'status',
      400
    );

    // Invalid input format
    await expect(
      userRequest.post('/users').send({ username, password: 'abc', name })
    ).resolves.toHaveProperty('status', 400);
  });

  it('POST /users should throw if username exist', async () => {
    const mockHasUser = hasUser as jest.Mock;
    mockHasUser.mockImplementationOnce(async () => true);

    const username = 'MJAtLogto';
    const password = 'PASSWORD';
    const name = 'Micheal';

    await expect(
      userRequest.post('/users').send({ username, password, name })
    ).resolves.toHaveProperty('status', 422);
  });

  it('PATCH /users/:userId', async () => {
    const name = 'Micheal';
    const avatar = 'http://www.micheal.png';

    const response = await userRequest.patch('/users/foo').send({ name, avatar });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockUserResponse,
      name,
      avatar,
    });
  });

  it('PATCH /users/:userId should allow updated with empty avatar', async () => {
    const name = 'Micheal';
    const avatar = '';

    const response = await userRequest.patch('/users/foo').send({ name, avatar });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockUserResponse,
      name,
      avatar,
    });
  });

  it('PATCH /users/:userId should updated with one field if the other is undefined', async () => {
    const name = 'Micheal';

    const updateNameResponse = await userRequest.patch('/users/foo').send({ name });
    expect(updateNameResponse.status).toEqual(200);
    expect(updateNameResponse.body).toEqual({
      ...mockUserResponse,
      name,
    });

    const avatar = 'https://www.miceal.png';
    const updateAvatarResponse = await userRequest.patch('/users/foo').send({ avatar });
    expect(updateAvatarResponse.status).toEqual(200);
    expect(updateAvatarResponse.body).toEqual({
      ...mockUserResponse,
      avatar,
    });
  });

  it('PATCH /users/:userId throw with invalid input params', async () => {
    const name = 'Micheal';
    const avatar = 'http://www.micheal.png';

    await expect(userRequest.patch('/users/foo').send({ avatar })).resolves.toHaveProperty(
      'status',
      200
    );

    await expect(
      userRequest.patch('/users/foo').send({ name, avatar: 'non url' })
    ).resolves.toHaveProperty('status', 400);
  });

  it('PATCH /users/:userId throw if user not found', async () => {
    const name = 'Micheal';
    const avatar = 'http://www.micheal.png';

    const mockFindUserById = findUserById as jest.Mock;
    mockFindUserById.mockImplementationOnce(() => {
      throw new Error(' ');
    });

    await expect(userRequest.patch('/users/foo').send({ name, avatar })).resolves.toHaveProperty(
      'status',
      500
    );
    expect(updateUserById).not.toBeCalled();
  });

  it('PATCH /users/:userId should throw if role names are invalid', async () => {
    const mockedFindRolesByRoleNames = findRolesByRoleNames as jest.Mock;
    mockedFindRolesByRoleNames.mockImplementationOnce(
      async (): Promise<Role[]> => [
        { name: 'worker', description: 'none' },
        { name: 'cleaner', description: 'none' },
      ]
    );
    await expect(
      userRequest.patch('/users/foo').send({ roleNames: ['admin'] })
    ).resolves.toHaveProperty('status', 400);
    expect(findUserById).toHaveBeenCalledTimes(1);
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('PATCH /users/:userId should update if roleNames field is an empty array', async () => {
    const roleNames: string[] = [];

    const response = await userRequest.patch('/users/foo').send({ roleNames });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockUserResponse,
      roleNames,
    });
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

  it('PATCH /users/:userId/password throw if user not found', async () => {
    const notExistedUserId = 'notExistedUserId';
    const dummyPassword = '123456';
    const mockedFindUserById = findUserById as jest.Mock;
    mockedFindUserById.mockImplementationOnce((userId) => {
      if (userId === notExistedUserId) {
        throw new Error(' ');
      }
    });

    await expect(
      userRequest.patch(`/users/${notExistedUserId}/password`).send({ password: dummyPassword })
    ).resolves.toHaveProperty('status', 500);
    expect(encryptUserPassword).not.toHaveBeenCalled();
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('DELETE /users/:userId', async () => {
    const userId = 'foo';
    const response = await userRequest.delete(`/users/${userId}`);
    expect(response.status).toEqual(204);
  });

  it('DELETE /users/:userId should throw if user not found', async () => {
    const notExistedUserId = 'notExisitedUserId';
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

  it('DELETE /users/:userId/identities/:target should throw if user not found', async () => {
    const notExistedUserId = 'notExisitedUserId';
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

  it('DELETE /users/:userId/identities/:target should throw if user found and connector is not found', async () => {
    const arbitraryUserId = 'arbitraryUserId';
    const nonexistentTarget = 'nonexistentTarget';
    const mockedFindUserById = findUserById as jest.Mock;
    mockedFindUserById.mockImplementationOnce((userId) => {
      if (userId === arbitraryUserId) {
        return { identities: { connector1: {}, connector2: {} } };
      }
    });
    await expect(
      userRequest.delete(`/users/${arbitraryUserId}/identities/${nonexistentTarget}`)
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
