import { Context } from 'koa';
import { IRouterParamContext } from 'koa-router';
import { SlonikError } from 'slonik';

import RequestError from '@/errors/RequestError';
import * as userQuies from '@/queries/user';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import { WithAuthContext } from './koa-auth';
import koaRoleGuard from './koa-role-guard';

const findUserByIdSpy = jest.spyOn(userQuies, 'findUserById');

// TODO: remove after log-1530 PR is merged and rebased
const mockUser = {
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

describe('koaRoleGuard middleware', () => {
  const baseCtx = createContextWithRouteParameters();

  const ctx: WithAuthContext<Context & IRouterParamContext> = {
    ...baseCtx,
    auth: 'foo',
  };

  const unauthorizedError = new RequestError({ code: 'auth.unauthorized', status: 401 });

  const next = jest.fn();

  it('should throw if user not found', async () => {
    findUserByIdSpy.mockRejectedValueOnce(new SlonikError());
    await expect(koaRoleGuard()(ctx, next)).rejects.toMatchError(unauthorizedError);
  });

  it('should throw if user dose not have admin role', async () => {
    findUserByIdSpy.mockResolvedValueOnce({ ...mockUser, roleNames: ['guest'] });
    await expect(koaRoleGuard()(ctx, next)).rejects.toMatchError(unauthorizedError);
  });

  it('should not throw for admin user', async () => {
    findUserByIdSpy.mockResolvedValueOnce(mockUser);
    await expect(koaRoleGuard()(ctx, next)).resolves.not.toThrow();
  });
});
