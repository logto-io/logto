import { CreateUser, User } from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { hasUser, findUserById } from '@/queries/user';
import { mockUser, mockUserResponse } from '@/utils/test-utils';

import adminUserRoutes from './admin-user';
import { AuthedRouter } from './types';

jest.mock('@/queries/user', () => ({
  findTotalNumberOfUsers: jest.fn(async () => ({ count: 10 })),
  findAllUsers: jest.fn(async (): Promise<User[]> => [mockUser]),
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  hasUser: jest.fn(async () => false),
  updateUserById: jest.fn(
    async (_, data: Partial<CreateUser>): Promise<User> => ({
      ...mockUser,
      ...data,
    })
  ),
  insertUser: jest.fn(
    async (user: CreateUser): Promise<User> => ({
      ...mockUser,
      ...user,
    })
  ),
}));

jest.mock('@/lib/user', () => ({
  generateUserId: jest.fn(() => 'fooId'),
  encryptUserPassword: jest.fn(() => ({
    passwordEncryptionSalt: 'salt',
    passwordEncrypted: 'password',
    passwordEncryptionMethod: 'saltAndPepper',
  })),
}));

describe('adminUserRoutes', () => {
  const app = new Koa();
  const router: AuthedRouter = new Router();

  adminUserRoutes(router);
  app.use(router.routes()).use(router.allowedMethods());

  const userRequest = request(app.callback());

  it('GET /users', async () => {
    const response = await userRequest.get('/users');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockUserResponse]);
  });

  it('GET /users/:userId', async () => {
    const response = await userRequest.get('/users/foo');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockUserResponse);
  });

  it('POST /users', async () => {
    const username = 'MJ@logto.io';
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
    const username = 'MJ@logto.io';
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
      userRequest.post('/users').send({ username: 'xy', password, name })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      userRequest.post('/users').send({ username, password: 'abc', name })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      userRequest.post('/users').send({ username, password, name: 'xy' })
    ).resolves.toHaveProperty('status', 400);
  });

  it('POST /users should throw if username exist', async () => {
    const mockHasUser = hasUser as jest.Mock;
    mockHasUser.mockImplementationOnce(async () => Promise.resolve(true));

    const username = 'MJ@logto.io';
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
  });
});
