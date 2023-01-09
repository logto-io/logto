import type { User } from '@logto/schemas';
import { UserRole, SignInIdentifier } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import Provider from 'oidc-provider';

import { mockSignInExperience, mockSignInMethod, mockUser } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import { checkRequiredProfile, signInWithPassword } from './utils.js';

const insertUser = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const hasActiveUsers = jest.fn(async () => true);
const findDefaultSignInExperience = jest.fn(async () => ({
  ...mockSignInExperience,
  signUp: {
    ...mockSignInExperience.signUp,
    identifiers: [SignInIdentifier.Username],
  },
}));

jest.mock('#src/queries/user.js', () => ({
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

jest.mock('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
}));

jest.mock('#src/libraries/user.js', () => ({
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

describe('checkRequiredProfile', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let mockDate: jest.SpyInstance;
  const mockedExpiredAt = '2022-02-02';
  beforeEach(() => {
    interactionDetails.mockResolvedValueOnce({ params: {} });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockDate = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockedExpiredAt);
  });

  afterEach(() => {
    mockDate.mockRestore();
  });

  it("throw if password is required but the user's password is not set", async () => {
    const user = {
      ...mockUser,
      passwordEncrypted: null,
      passwordEncryptionMethod: null,
      identities: {},
    };

    const signInExperience = {
      ...mockSignInExperience,
      signUp: {
        ...mockSignInExperience.signUp,
        password: true,
      },
    };

    await expect(
      checkRequiredProfile(createContext(), createProvider(), user, signInExperience)
    ).rejects.toThrowError(
      new RequestError({ code: 'user.password_required_in_profile', status: 422 })
    );

    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ continueSignIn: { userId: user.id, expiresAt: mockedExpiredAt } })
    );
  });

  it("throw if the sign up identifier is ['username'] but the user's username is missing", async () => {
    const user = {
      ...mockUser,
      username: null,
    };
    const signInExperience = {
      ...mockSignInExperience,
      signUp: {
        ...mockSignInExperience.signUp,
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
    };

    await expect(
      checkRequiredProfile(createContext(), createProvider(), user, signInExperience)
    ).rejects.toThrowError(
      new RequestError({ code: 'user.username_required_in_profile', status: 422 })
    );

    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ continueSignIn: { userId: user.id, expiresAt: mockedExpiredAt } })
    );
  });

  it("throw if the sign up identifier is ['email'] but the user's email is missing", async () => {
    const user = {
      ...mockUser,
      primaryEmail: null,
    };
    const signInExperience = {
      ...mockSignInExperience,
      signUp: {
        ...mockSignInExperience.signUp,
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      },
    };

    await expect(
      checkRequiredProfile(createContext(), createProvider(), user, signInExperience)
    ).rejects.toThrowError(
      new RequestError({ code: 'user.email_required_in_profile', status: 422 })
    );

    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ continueSignIn: { userId: user.id, expiresAt: mockedExpiredAt } })
    );
  });

  it("throw if the sign up identifier is ['sms'] but the user's phone is missing", async () => {
    const user = {
      ...mockUser,
      primaryPhone: null,
    };
    const signInExperience = {
      ...mockSignInExperience,
      signUp: {
        ...mockSignInExperience.signUp,
        identifiers: [SignInIdentifier.Phone],
        password: true,
        verify: true,
      },
    };

    await expect(
      checkRequiredProfile(createContext(), createProvider(), user, signInExperience)
    ).rejects.toThrowError(
      new RequestError({ code: 'user.phone_required_in_profile', status: 422 })
    );

    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ continueSignIn: { userId: user.id, expiresAt: mockedExpiredAt } })
    );
  });

  it("throw if the sign up identifier is ['email', 'sms'] but the user's email and phone are missing", async () => {
    const user = {
      ...mockUser,
      primaryEmail: null,
      primaryPhone: null,
    };
    const signInExperience = {
      ...mockSignInExperience,
      signUp: {
        ...mockSignInExperience.signUp,
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        password: true,
        verify: true,
      },
    };

    await expect(
      checkRequiredProfile(createContext(), createProvider(), user, signInExperience)
    ).rejects.toThrowError(
      new RequestError({ code: 'user.email_or_phone_required_in_profile', status: 422 })
    );

    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ continueSignIn: { userId: user.id, expiresAt: mockedExpiredAt } })
    );
  });

  it.each([{ primaryEmail: null }, { primaryPhone: null }])(
    "check successfully if the sign up identifier is ['email', 'sms'] and the user has an email or phone",
    async (userProfile) => {
      const user = {
        ...mockUser,
        ...userProfile,
      };
      const signInExperience = {
        ...mockSignInExperience,
        signUp: {
          ...mockSignInExperience.signUp,
          identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
          password: true,
          verify: true,
        },
      };

      await expect(
        checkRequiredProfile(createContext(), createProvider(), user, signInExperience)
      ).resolves.not.toThrow();

      expect(interactionResult).not.toBeCalled();
    }
  );
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

  it('throw if user is suspended', async () => {
    interactionDetails.mockResolvedValueOnce({ params: {} });
    await expect(
      signInWithPassword(createContext(), createProvider(), {
        identifier: SignInIdentifier.Username,
        password: 'password',
        findUser: jest.fn(async () => ({
          ...mockUser,
          isSuspended: true,
        })),
        logType: 'SignInUsernamePassword',
        logPayload: { username: 'username' },
      })
    ).rejects.toThrowError(new RequestError('user.suspended'));
  });

  it('throw if sign in method is not enabled', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      signIn: {
        methods: [
          {
            ...mockSignInMethod,
            identifier: SignInIdentifier.Phone,
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
