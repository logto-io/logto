import type { User } from '@logto/schemas';
import { UserRole, SignInIdentifier, adminConsoleApplicationId } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { mockSignInExperience, mockUser } from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

import passwordRoutes, { registerRoute, signInRoute } from './password.js';

const insertUser = jest.fn(async (..._args: unknown[]) => mockUser);
const hasUser = jest.fn(async (username: string) => username === 'username1');
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => mockUser);
const hasActiveUsers = jest.fn(async () => true);
const findDefaultSignInExperience = jest.fn(async () => mockSignInExperience);

jest.mock('#src/queries/user.js', () => ({
  findUserById: async () => findUserById(),
  findUserByIdentity: async () => ({ id: mockUser.id, identities: {} }),
  findUserByPhone: async () => mockUser,
  findUserByEmail: async () => mockUser,
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUser: async (username: string) => hasUser(username),
  hasUserWithIdentity: async (connectorId: string, userId: string) =>
    connectorId === 'connectorId' && userId === mockUser.id,
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
  hasActiveUsers: async () => hasActiveUsers(),
  async findUserByUsername(username: string) {
    const roleNames = username === 'admin' ? [UserRole.Admin] : [];

    return { ...mockUser, username, roleNames };
  },
}));

jest.mock('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
}));

jest.mock('#src/libraries/user.js', () => ({
  async verifyUserPassword(user: User) {
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

jest.mock('#src/libraries/session.js', () => ({
  ...jest.requireActual('#src/libraries/session.js'),
  getApplicationIdFromInteraction: jest.fn(),
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

describe('session -> password routes', () => {
  const sessionRequest = createRequester({
    // @ts-expect-error will remove once interaction refactor finished
    anonymousRoutes: passwordRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  it('POST /session/sign-in/password/username', async () => {
    interactionDetails.mockResolvedValueOnce({ params: {} });
    const response = await sessionRequest.post(`${signInRoute}/username`).send({
      username: 'username',
      password: 'password',
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('redirectTo');
    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ login: { accountId: mockUser.id } }),
      expect.anything()
    );
  });

  it('POST /session/sign-in/password/email', async () => {
    interactionDetails.mockResolvedValueOnce({ params: {} });
    const response = await sessionRequest.post(`${signInRoute}/email`).send({
      email: 'email',
      password: 'password',
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('redirectTo');
    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ login: { accountId: mockUser.id } }),
      expect.anything()
    );
  });

  it('POST /session/sign-in/password/sms', async () => {
    interactionDetails.mockResolvedValueOnce({ params: {} });
    const response = await sessionRequest.post(`${signInRoute}/sms`).send({
      phone: 'phone',
      password: 'password',
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('redirectTo');
    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ login: { accountId: mockUser.id } }),
      expect.anything()
    );
  });

  describe('POST /session/register/password/username', () => {
    it('assign result and redirect', async () => {
      interactionDetails.mockResolvedValueOnce({ params: {} });

      const fakeTime = Date.now();
      jest.useFakeTimers().setSystemTime(fakeTime);

      const response = await sessionRequest
        .post(`${registerRoute}/username`)
        .send({ username: 'username', password: 'password' });
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user1',
          username: 'username',
          passwordEncrypted: 'password_user1',
          passwordEncryptionMethod: 'Argon2i',
          roleNames: [],
          lastSignInAt: fakeTime,
        })
      );
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
      jest.useRealTimers();
    });

    it('register user with admin role for admin console if no active user found', async () => {
      interactionDetails.mockResolvedValueOnce({
        params: { client_id: adminConsoleApplicationId },
      });

      hasActiveUsers.mockResolvedValueOnce(false);

      await sessionRequest
        .post(`${registerRoute}/username`)
        .send({ username: 'username', password: 'password' });

      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          roleNames: ['admin'],
        })
      );
    });

    it('should not register user with admin role for admin console if any active user found', async () => {
      interactionDetails.mockResolvedValueOnce({
        params: { client_id: adminConsoleApplicationId },
      });

      await sessionRequest
        .post(`${registerRoute}/username`)
        .send({ username: 'username', password: 'password' });

      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          roleNames: [],
        })
      );
    });

    it('throw error if username not valid', async () => {
      const usernameStartedWithNumber = '1username';
      const response = await sessionRequest
        .post(`${registerRoute}/username`)
        .send({ username: usernameStartedWithNumber, password: 'password' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if username exists', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/username`)
        .send({ username: 'username1', password: 'password' });
      expect(response.statusCode).toEqual(422);
    });

    it('throws if sign up identifier is not username', async () => {
      interactionDetails.mockResolvedValueOnce({ params: {} });

      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        signUp: {
          ...mockSignInExperience.signUp,
          identifiers: [SignInIdentifier.Email],
        },
      });

      const response = await sessionRequest
        .post(`${registerRoute}/username`)
        .send({ username: 'username', password: 'password' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/password/check-username', () => {
    it('check and return empty', async () => {
      interactionDetails.mockResolvedValueOnce({ params: {} });

      const response = await sessionRequest
        .post(`${registerRoute}/check-username`)
        .send({ username: 'username' });
      expect(response.status).toEqual(204);
      expect(hasUser).toHaveBeenCalled();
    });

    it('throw error if username not valid', async () => {
      const usernameStartedWithNumber = '1username';
      const response = await sessionRequest
        .post(`${registerRoute}/check-username`)
        .send({ username: usernameStartedWithNumber, password: 'password' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if username exists', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/check-username`)
        .send({ username: 'username1' });
      expect(response.statusCode).toEqual(422);
    });

    it('throws if sign up identifier is not username', async () => {
      interactionDetails.mockResolvedValueOnce({ params: {} });

      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        signUp: {
          ...mockSignInExperience.signUp,
          identifiers: [SignInIdentifier.Email],
        },
      });

      const response = await sessionRequest
        .post(`${registerRoute}/check-username`)
        .send({ username: 'username' });
      expect(response.statusCode).toEqual(422);
    });
  });
});
