import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, type User } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockSignInExperience, mockUser } from '#src/__mocks__/index.js';
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
  signInExperiences: {
    findDefaultSignInExperience: jest.fn(async () => ({
      ...mockSignInExperience,
      emailBlocklistPolicy: {
        customAllowlist: ['@allowed.com'],
      },
    })),
  },
} satisfies Partial2<Queries>;

const mockedLibraries = {
  users: {
    checkIdentifierCollision: jest.fn(),
  },
};

const emailAndPhoneRoutes = await pickDefault(import('./email-and-phone.js'));

describe('account email and phone routes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, undefined, mockedLibraries);
  const accountRequest = createRequester({
    authedRoutes: [
      (router) => {
        router.use(async (ctx, next) => {
          ctx.auth = {
            ...ctx.auth,
            id: mockUser.id,
            identityVerified: true,
            scopes: new Set([UserScope.Email]),
          };
          ctx.accountCenter = {
            enabled: true,
            fields: {
              email: AccountCenterControlValue.Edit,
            },
          };
          ctx.appendDataHookContext = jest.fn();

          return next();
        });
      },
      emailAndPhoneRoutes as never,
    ],
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject primary email update when the email does not match the custom allowlist', async () => {
    const response = await accountRequest.post('/my-account/primary-email').send({
      email: 'foo@bar.com',
      newIdentifierVerificationRecordId: 'verification-record-id',
    });

    expect(response.status).toBe(422);
    expect(mockedQueries.users.updateUserById).not.toHaveBeenCalled();
  });
});
