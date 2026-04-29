import { type User } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience, mockUser } from '#src/__mocks__/index.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { encryptUserPassword } = await mockEsmWithActual('#src/libraries/user.utils.js', () => ({
  encryptUserPassword: jest.fn().mockResolvedValue({
    passwordEncrypted: 'encrypted_password',
    passwordEncryptionMethod: mockUser.passwordEncryptionMethod,
  }),
}));

await mockEsmWithActual('../utils/password.js', () => ({
  checkPasswordPolicyForUser: jest.fn().mockResolvedValue([]),
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
} satisfies Partial2<Queries>;

const mockedLibraries = {
  users: {
    checkIdentifierCollision: jest.fn(),
    verifyUserPassword: jest.fn(),
  },
  verificationStatuses: {
    createVerificationStatus: jest.fn(),
    checkVerificationStatus: jest.fn(),
  },
};

const meUserRoutes = await pickDefault(import('./user.js'));

describe('me user routes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, undefined, mockedLibraries);
  const meRequest = createRequester({
    authedRoutes: [
      (router) => {
        router.use(async (ctx, next) => {
          ctx.auth = {
            ...ctx.auth,
            id: mockUser.id,
          };

          return next();
        });
      },
      meUserRoutes as never,
    ],
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('POST /password should update passwordUpdatedAt', async () => {
    const now = new Date('2026-01-10T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    const response = await meRequest.post('/password').send({ password: 'Password123' });

    expect(response.status).toBe(204);
    expect(encryptUserPassword).toHaveBeenCalledWith('Password123');

    const [, payload] = mockedQueries.users.updateUserById.mock.calls[0] as [string, Partial<User>];
    expect(payload.passwordUpdatedAt).toBe(now.getTime());
    expect(payload.isPasswordExpired).toBe(false);
  });
});
