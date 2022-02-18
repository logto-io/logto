import { User, userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';

import RequestError from '@/errors/RequestError';
import * as userQueries from '@/queries/user';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaUserInfo from './koa-user-info';

const findUserByIdSpy = jest.spyOn(userQueries, 'findUserById');

const mockUser: User = {
  id: 'foo',
  username: 'foo',
  primaryEmail: 'foo@logto.io',
  primaryPhone: '111111',
  roleNames: ['admin'],
  passwordEncrypted: null,
  passwordEncryptionMethod: null,
  passwordEncryptionSalt: null,
  name: null,
  avatar: null,
  identities: {},
  customData: {},
};

describe('koaUserInfo middleware', () => {
  const next = jest.fn();

  it('should set userInfo to the context', async () => {
    findUserByIdSpy.mockImplementationOnce(async () => Promise.resolve(mockUser));

    const ctx = {
      ...createContextWithRouteParameters(),
      auth: 'foo',
      userInfo: { id: '' }, // Bypass the middleware Context type
    };

    await koaUserInfo()(ctx, next);

    expect(ctx.userInfo).toEqual(pick(mockUser, ...userInfoSelectFields));
  });

  it('should throw if is not authenticated', async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      auth: 'foo',
      userInfo: { id: '' }, // Bypass the middleware Context type
    };

    await expect(koaUserInfo()(ctx, next)).rejects.toMatchError(
      new RequestError({ code: 'auth.unauthorized', status: 401 })
    );
  });
});
