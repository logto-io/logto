import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, userPasskeySignInDataKey, type User } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockUser } from '#src/__mocks__/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockedQueries = {
  users: {
    findUserById: jest.fn(async () => mockUser),
    updateUserById: jest.fn(async (_userId: string, data: Partial<User>) => ({
      ...mockUser,
      ...data,
    })),
  },
} satisfies Partial2<Queries>;

const { findUserById, updateUserById } = mockedQueries.users;

const logtoConfigRoutes = await pickDefault(import('./logto-config.js'));

describe('account logto-config routes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries);

  const buildRequester = (
    options: { identityVerified?: boolean; fields?: Record<string, AccountCenterControlValue> } = {}
  ) => {
    const { identityVerified = true, fields = { passkey: AccountCenterControlValue.Edit } } =
      options;

    return createRequester({
      middlewares: [koaI18next(), koaErrorHandler()],
      authedRoutes: [
        (router) => {
          router.use(async (ctx, next) => {
            ctx.auth = {
              ...ctx.auth,
              id: mockUser.id,
              identityVerified,
              scopes: new Set([UserScope.Identities]),
            };
            ctx.accountCenter = {
              enabled: true,
              fields,
            };
            ctx.appendDataHookContext = jest.fn();

            return next();
          });
        },
        logtoConfigRoutes as never,
      ],
      tenantContext,
    });
  };

  const accountRequest = buildRequester();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/my-account/logto-configs', () => {
    it('returns the user logto config with default values', async () => {
      const response = await accountRequest.get('/my-account/logto-configs');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        mfa: { skipped: false, skipMfaOnSignIn: false },
        passkeySignIn: { skipped: false },
      });
    });
  });

  describe('PATCH /api/my-account/logto-configs', () => {
    it('updates the passkey sign-in skip flag when identity is verified', async () => {
      const response = await accountRequest
        .patch('/my-account/logto-configs')
        .send({ passkeySignIn: { skipped: true } });

      expect(response.status).toBe(200);
      expect(response.body.passkeySignIn).toEqual({ skipped: true });

      const [updatedUserId, updatedData] = updateUserById.mock.calls[0] ?? [];
      expect(updatedUserId).toBe(mockUser.id);
      expect(updatedData?.logtoConfig).toMatchObject({
        [userPasskeySignInDataKey]: { skipped: true },
      });
    });

    it('rejects the update when identity is not verified', async () => {
      const unverifiedRequest = buildRequester({ identityVerified: false });

      const response = await unverifiedRequest
        .patch('/my-account/logto-configs')
        .send({ passkeySignIn: { skipped: true } });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code', 'verification_record.permission_denied');
      expect(findUserById).not.toHaveBeenCalled();
      expect(updateUserById).not.toHaveBeenCalled();
    });

    it('rejects the update when the passkey field is not editable', async () => {
      const readOnlyRequest = buildRequester({
        fields: { passkey: AccountCenterControlValue.ReadOnly },
      });

      const response = await readOnlyRequest
        .patch('/my-account/logto-configs')
        .send({ passkeySignIn: { skipped: true } });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'account_center.field_not_editable');
      expect(updateUserById).not.toHaveBeenCalled();
    });
  });
});
