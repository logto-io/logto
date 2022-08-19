import { User, UserRole } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import { Provider } from 'oidc-provider';

import { mockUser } from '@/__mocks__';
import RequestError from '@/errors/RequestError';
import { createRequester } from '@/utils/test-utils';

import sessionRoutes from './session';

const insertUser = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const hasActiveUsers = jest.fn(async () => true);

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
}));

jest.mock('@/lib/user', () => ({
  async findUserByUsernameAndPassword(username: string, password: string) {
    if (username !== 'username' && username !== 'admin') {
      throw new RequestError('session.invalid_credentials');
    }

    if (password !== 'password') {
      throw new RequestError('session.invalid_credentials');
    }

    const roleNames = username === 'admin' ? [UserRole.Admin] : [];

    return { id: 'user1', roleNames };
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

describe('sessionRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: sessionRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  describe('POST /session', () => {
    it('should redirect to /session/consent with consent prompt name', async () => {
      interactionDetails.mockResolvedValueOnce({
        prompt: { name: 'consent' },
      });
      const response = await sessionRequest.post('/session');

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty(
        'redirectTo',
        expect.stringContaining('/session/consent')
      );
    });

    it('throw error with other prompt name', async () => {
      interactionDetails.mockResolvedValueOnce({
        prompt: { name: 'invalid' },
      });
      await expect(sessionRequest.post('/session').send({})).resolves.toHaveProperty('status', 400);
    });
  });

  describe('POST /session/sign-in/username-password', () => {
    it('assign result and redirect', async () => {
      interactionDetails.mockResolvedValueOnce({ params: {} });
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'username',
        password: 'password',
      });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('throw if user not found', async () => {
      interactionDetails.mockResolvedValueOnce({ params: {} });
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'notexistuser',
        password: 'password',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw if user found but wrong password', async () => {
      interactionDetails.mockResolvedValueOnce({ params: {} });
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'username',
        password: '_password',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw if non-admin user sign in to AC', async () => {
      interactionDetails.mockResolvedValueOnce({
        params: { client_id: adminConsoleApplicationId },
      });
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'username',
        password: 'password',
      });

      expect(response.statusCode).toEqual(403);
      console.log(response);
    });

    it('should throw if admin user sign in to AC', async () => {
      interactionDetails.mockResolvedValueOnce({
        params: { client_id: adminConsoleApplicationId },
      });
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'admin',
        password: 'password',
      });

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('POST /session/register/username-password', () => {
    it('assign result and redirect', async () => {
      interactionDetails.mockResolvedValueOnce({ params: {} });

      const response = await sessionRequest
        .post('/session/register/username-password')
        .send({ username: 'username', password: 'password' });
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user1',
          username: 'username',
          passwordEncrypted: 'password_user1',
          passwordEncryptionMethod: 'Argon2i',
          roleNames: [],
        })
      );
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('register user with admin role for admin console if no active user found', async () => {
      interactionDetails.mockResolvedValueOnce({
        params: { client_id: adminConsoleApplicationId },
      });

      hasActiveUsers.mockResolvedValueOnce(false);

      await sessionRequest
        .post('/session/register/username-password')
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
        .post('/session/register/username-password')
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
        .post('/session/register/username-password')
        .send({ username: usernameStartedWithNumber, password: 'password' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if username exists', async () => {
      const response = await sessionRequest
        .post('/session/register/username-password')
        .send({ username: 'username1', password: 'password' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/consent', () => {
    describe('should call grant.save() and assign interaction results', () => {
      afterEach(() => {
        updateUserById.mockClear();
      });

      it('with empty details and reusing old grant', async () => {
        interactionDetails.mockResolvedValueOnce({
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          prompt: { details: {} },
        });
        const response = await sessionRequest.post('/session/consent');
        expect(response.statusCode).toEqual(200);
        expect(grantSave).toHaveBeenCalled();
        expect(interactionResult).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            consent: { grantId: 'finalGrantId' },
          }),
          expect.anything()
        );
      });
      it('with empty details and creating new grant', async () => {
        interactionDetails.mockResolvedValueOnce({
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          prompt: { details: {} },
          grantId: 'exists',
        });
        const response = await sessionRequest.post('/session/consent');
        expect(response.statusCode).toEqual(200);
        expect(grantSave).toHaveBeenCalled();
        expect(interactionResult).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            consent: { grantId: 'finalGrantId' },
          }),
          expect.anything()
        );
      });
      it('should save application id when the user first consented', async () => {
        interactionDetails.mockResolvedValueOnce({
          session: { accountId: mockUser.id },
          params: { client_id: 'clientId' },
          prompt: {
            name: 'consent',
            details: {},
            reasons: ['consent_prompt', 'native_client_prompt'],
          },
          grantId: 'grantId',
        });
        findUserById.mockImplementationOnce(async () => ({ ...mockUser, applicationId: null }));
        const response = await sessionRequest.post('/session/consent');
        expect(updateUserById).toHaveBeenCalledWith(mockUser.id, { applicationId: 'clientId' });
        expect(response.statusCode).toEqual(200);
      });
      it('missingOIDCScope and missingResourceScopes', async () => {
        interactionDetails.mockResolvedValueOnce({
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          prompt: {
            details: {
              missingOIDCScope: ['scope1', 'scope2'],
              missingResourceScopes: {
                resource1: ['scope1', 'scope2'],
                resource2: ['scope3'],
              },
            },
          },
        });
        const response = await sessionRequest.post('/session/consent');
        expect(response.statusCode).toEqual(200);
        expect(grantAddOIDCScope).toHaveBeenCalledWith('scope1 scope2');
        expect(grantAddResourceScope).toHaveBeenCalledWith('resource1', 'scope1 scope2');
        expect(grantAddResourceScope).toHaveBeenCalledWith('resource2', 'scope3');
        expect(interactionResult).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            consent: { grantId: 'finalGrantId' },
          }),
          expect.anything()
        );
      });
    });
    it('throws if session is missing', async () => {
      interactionDetails.mockResolvedValueOnce({ params: { client_id: 'clientId' } });
      await expect(sessionRequest.post('/session/consent')).resolves.toHaveProperty(
        'statusCode',
        400
      );
    });
  });

  it('DELETE /session', async () => {
    const response = await sessionRequest.delete('/session');
    expect(response.body).toHaveProperty('redirectTo');
    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ error: 'oidc.aborted' }),
      expect.anything()
    );
  });
});
