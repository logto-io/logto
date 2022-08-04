import { mockUser, mockUserResponse } from '@/__mocks__';
import RequestError from '@/errors/RequestError';
import * as userQueries from '@/queries/user';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaUserInfo from './koa-user-info';

const findUserByIdSpy = jest.spyOn(userQueries, 'findUserById');

describe('koaUserInfo middleware', () => {
  const next = jest.fn();

  it('should set userInfo to the context', async () => {
    findUserByIdSpy.mockImplementationOnce(async () => mockUser);

    const ctx = {
      ...createContextWithRouteParameters(),
      auth: 'foo',
      userInfo: { id: '' }, // Bypass the middleware Context type
    };

    await koaUserInfo()(ctx, next);

    expect(ctx.userInfo).toEqual(mockUserResponse);
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
