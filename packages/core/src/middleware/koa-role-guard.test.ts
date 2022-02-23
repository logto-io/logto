import { UserRole } from '@logto/schemas';
import { Context } from 'koa';

import RequestError from '@/errors/RequestError';
import { mockUser } from '@/utils/mock';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import { WithAuthContext } from './koa-auth';
import koaRoleGuard from './koa-role-guard';
import { WithUserInfoContext } from './koa-user-info';

describe('koaRoleGuard middleware', () => {
  const baseCtx = createContextWithRouteParameters();

  const ctx: WithUserInfoContext<Context & WithAuthContext> = {
    ...baseCtx,
    auth: 'foo',
    userInfo: mockUser,
  };

  const unauthorizedError = new RequestError({ code: 'auth.unauthorized', status: 401 });

  const next = jest.fn();

  it('should throw if user dose not have admin role', async () => {
    ctx.userInfo.roleNames = ['guest'];
    await expect(koaRoleGuard(UserRole.admin)(ctx, next)).rejects.toMatchError(unauthorizedError);
  });

  it('should not throw for admin user', async () => {
    ctx.userInfo.roleNames = ['admin'];
    await expect(koaRoleGuard(UserRole.admin)(ctx, next)).resolves.not.toThrow();
  });
});
