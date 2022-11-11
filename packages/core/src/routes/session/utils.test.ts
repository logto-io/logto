import type { User } from '@logto/schemas';
import { UserRole, SignInIdentifier, SignUpIdentifier } from '@logto/schemas';
import { createMockContext } from '@shopify/jest-koa-mocks';
import type { Nullable } from '@silverhand/essentials';
import { Provider } from 'oidc-provider';

import { mockSignInExperience, mockSignInMethod, mockUser } from '@/__mocks__';
import RequestError from '@/errors/RequestError';

import { signInWithPassword } from './utils';

const insertUser = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const hasActiveUsers = jest.fn(async () => true);
const findDefaultSignInExperience = jest.fn(async () => ({
  ...mockSignInExperience,
  signUp: {
    ...mockSignInExperience.signUp,
    identifier: SignUpIdentifier.Username,
  },
}));

jest.mock('@/queries/user', () => ({
  findUserById: async () => findUserById(),
  findUserByIdentity: async () => ({ id: 'id', identities: {} }),
  findUserByPhone: async () => ({ id: 'id' }),
  findUserByEmail: async () => ({ id: 'id' }),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUser: async (username: string) => username === 'username1',
  hasUserWithIdentity: async (connectorId: string, userId: string) =>
    connectorId === 'connectorId' && userId === 'id',
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
  hasActiveUsers: async () => hasActiveUsers(),
  async findUserByUsername(username: string) {
    const roleNames = username === 'admin' ? [UserRole.Admin] : [];

    return { id: 'user1', username, roleNames };
  },
}));

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
}));

jest.mock('@/lib/user', () => ({
  async verifyUserPassword(user: Nullable<User>, password: string) {
    if (!user) {
      throw new RequestError('session.invalid_credentials');
    }

    if (password !== 'password') {
      throw new RequestError('session.invalid_credentials');
    }

    return user;
  },
  generateUserId: () => 'user1',
  encryptUserPassword: (password: string) => ({
    passwordEncrypted: password + '_user1',
    passwordEncryptionMethod: 'Argon2i',
  }),
  updateLastSignInAt: async (...args: unknown[]) => updateUserById(...args),
  insertUser: async (...args: unknown[]) => insertUser(...args),
}));

const grantSave = jest.fn(async () => 'finalGrantId');
const grantAddOIDCScope = jest.fn();
const grantAddResourceScope = jest.fn();
const interactionResult = jest.fn(async () => 'redirectTo');
const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({}));

class Grant {
  static async find(id: string) {
    return id === 'exists' ? new Grant() : undefined;
  }

  save: typeof grantSave;
  addOIDCScope: typeof grantAddOIDCScope;
  addResourceScope: typeof grantAddResourceScope;

  constructor() {
    this.save = grantSave;
    this.addOIDCScope = grantAddOIDCScope;
    this.addResourceScope = grantAddResourceScope;
  }
}

const createContext = () => ({
  ...createMockContext(),
  addLogContext: jest.fn(),
  log: jest.fn(),
});

const createProvider = () => new Provider('');

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    Grant,
    interactionDetails,
    interactionResult,
  })),
}));

afterEach(() => {
  grantSave.mockClear();
  interactionResult.mockClear();
});

describe('signInWithPassword()', () => {
  it('assign result', async () => {
    interactionDetails.mockResolvedValueOnce({ params: {} });
    await signInWithPassword(createContext(), createProvider(), {
      identifier: SignInIdentifier.Username,
      password: 'password',
      findUser: jest.fn(async () => mockUser),
      logType: 'SignInUsernamePassword',
      logPayload: { username: 'username' },
    });
    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ login: { accountId: mockUser.id } }),
      expect.anything()
    );
  });

  it('throw if user not found', async () => {
    interactionDetails.mockResolvedValueOnce({ params: {} });
    await expect(
      signInWithPassword(createContext(), createProvider(), {
        identifier: SignInIdentifier.Username,
        password: 'password',
        findUser: jest.fn(async () => null),
        logType: 'SignInUsernamePassword',
        logPayload: { username: 'username' },
      })
    ).rejects.toThrowError(new RequestError('session.invalid_credentials'));
  });

  it('throw if user found but wrong password', async () => {
    interactionDetails.mockResolvedValueOnce({ params: {} });
    await expect(
      signInWithPassword(createContext(), createProvider(), {
        identifier: SignInIdentifier.Username,
        password: '_password',
        findUser: jest.fn(async () => mockUser),
        logType: 'SignInUsernamePassword',
        logPayload: { username: 'username' },
      })
    ).rejects.toThrowError(new RequestError('session.invalid_credentials'));
  });

  it('throw if sign in method is not enabled', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      signIn: {
        methods: [
          {
            ...mockSignInMethod,
            identifier: SignInIdentifier.Sms,
            password: false,
          },
        ],
      },
    });
    interactionDetails.mockResolvedValueOnce({ params: {} });
    await expect(
      signInWithPassword(createContext(), createProvider(), {
        identifier: SignInIdentifier.Username,
        password: 'password',
        findUser: jest.fn(async () => mockUser),
        logType: 'SignInUsernamePassword',
        logPayload: { username: 'username' },
      })
    ).rejects.toThrowError(
      new RequestError({
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      })
    );
  });
});
