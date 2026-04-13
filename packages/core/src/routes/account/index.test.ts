import { AccountCenterControlValue, type AccountCenter, type User } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience, mockUser } from '#src/__mocks__/index.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);
const mockValidatePassword = jest.fn();

await mockEsmWithActual('./email-and-phone.js', () => ({ default: jest.fn() }));
await mockEsmWithActual('./grants.js', () => ({ default: jest.fn() }));
await mockEsmWithActual('./identities.js', () => ({ default: jest.fn() }));
await mockEsmWithActual('./logto-config.js', () => ({ default: jest.fn() }));
await mockEsmWithActual('./mfa-verifications.js', () => ({ default: jest.fn() }));
await mockEsmWithActual('./sessions.js', () => ({ default: jest.fn() }));
await mockEsmWithActual('./third-party-tokens.js', () => ({ default: jest.fn() }));
await mockEsmWithActual('../experience/classes/libraries/password-validator.js', () => ({
  PasswordValidator: class {
    public async validatePassword(...args: unknown[]) {
      return mockValidatePassword(...args);
    }
  },
}));

const { encryptUserPassword } = await mockEsmWithActual('#src/libraries/user.utils.js', () => ({
  encryptUserPassword: jest.fn().mockResolvedValue({
    passwordEncrypted: 'encrypted_password',
    passwordEncryptionMethod: mockUser.passwordEncryptionMethod,
  }),
}));

const mockedQueries = {
  users: {
    findUserById: jest.fn(async () => mockUser),
    updateUserById: jest.fn(async (_userId: string, data: Partial<User>) => ({
      ...mockUser,
      ...data,
    })),
  },
  signInExperiences: {
    findDefaultSignInExperience: jest.fn(async () => mockSignInExperience),
  },
  accountCenters: {
    findDefaultAccountCenter: jest.fn(
      async (): Promise<AccountCenter> => ({
        tenantId: mockUser.tenantId,
        id: 'default',
        enabled: true,
        fields: {
          password: AccountCenterControlValue.Edit,
        },
        webauthnRelatedOrigins: [],
        deleteAccountUrl: null,
        customCss: null,
      })
    ),
  },
} satisfies Partial2<Queries>;

const mockedLibraries = {
  users: {
    checkIdentifierCollision: jest.fn(),
  },
};

const accountRoutes = await pickDefault(import('./index.js'));

describe('account routes password', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, undefined, mockedLibraries);
  const accountRequest = createRequester({
    authedRoutes: [
      (router) => {
        router.use(async (ctx, next) => {
          ctx.auth = {
            ...ctx.auth,
            id: mockUser.id,
            identityVerified: true,
            scopes: new Set(),
          };
          ctx.appendDataHookContext = jest.fn();

          return next();
        });
      },
      accountRoutes as never,
    ],
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('POST /my-account/password should update passwordUpdatedAt', async () => {
    const now = new Date('2026-01-10T00:00:00.000Z');
    const newPassword = 'V@lidPassword123!';
    jest.useFakeTimers().setSystemTime(now);

    const response = await accountRequest.post('/my-account/password').send({
      password: newPassword,
    });

    expect(response.status).toBe(204);
    expect(mockValidatePassword).toHaveBeenCalled();
    expect(encryptUserPassword).toHaveBeenCalledWith(newPassword);

    const [, payload] = mockedQueries.users.updateUserById.mock.calls[0] as [string, Partial<User>];
    expect(payload.passwordUpdatedAt).toBe(now.getTime());
  });
});
