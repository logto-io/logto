/* eslint-disable max-lines */
import { Provider } from 'oidc-provider';

import { ConnectorType } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import { createRequester } from '@/utils/test-utils';

import sessionRoutes from './session';

jest.mock('@/lib/user', () => ({
  async findUserByUsernameAndPassword(username: string, password: string) {
    if (username !== 'username') {
      throw new RequestError({ code: 'entity.not_found', status: 404 });
    }

    if (password !== 'password') {
      throw new RequestError('session.invalid_credentials');
    }

    return { id: 'user1' };
  },
  generateUserId: () => 'user1',
  encryptUserPassword: (userId: string, password: string) => ({
    passwordEncrypted: userId + '_' + password + '_user1',
    passwordEncryptionMethod: 'SaltAndPepper',
    passwordEncryptionSalt: 'user1',
  }),
}));
jest.mock('@/lib/social', () => ({
  ...jest.requireActual('@/lib/social'),
  async findSocialRelatedUser() {
    return ['phone', { id: 'user1', identities: {} }];
  },
  async getUserInfoByAuthCode(connectorId: string, authCode: string) {
    if (connectorId === '_connectorId') {
      throw new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        connectorId,
      });
    }

    if (authCode === '123456') {
      return { id: 'id' };
    }

    // This mocks the case that can not get userInfo with access token and auth code
    // (most likely third-party social connectors' problem).
    throw new Error(' ');
  },
}));
const insertUser = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
jest.mock('@/queries/user', () => ({
  findUserById: async () => ({ id: 'id' }),
  findUserByIdentity: async () => ({ id: 'id', identities: {} }),
  findUserByPhone: async () => ({ id: 'id' }),
  findUserByEmail: async () => ({ id: 'id' }),
  insertUser: async (...args: unknown[]) => insertUser(...args),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUser: async (username: string) => username === 'username1',
  hasUserWithIdentity: async (connectorId: string, userId: string) =>
    connectorId === 'connectorId' && userId === 'id',
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
}));
const sendPasscode = jest.fn();
jest.mock('@/lib/passcode', () => ({
  createPasscode: async () => ({ id: 'id' }),
  sendPasscode: () => {
    sendPasscode();
  },
  verifyPasscode: async (_a: unknown, _b: unknown, code: string) => {
    if (code !== '1234') {
      throw new RequestError('passcode.code_mismatch');
    }
  },
}));
const getAuthorizationUri = jest.fn(async (_redirectUri: string, _state: string) => {
  return '';
});
const getConnectorInstanceById = jest.fn(async (connectorId: string) => {
  const connector = {
    enabled: connectorId === 'social_enabled',
  };
  const metadata = {
    id:
      connectorId === 'social_enabled'
        ? 'social_enabled'
        : connectorId === 'social_disabled'
        ? 'social_disabled'
        : 'others',
    type: connectorId.startsWith('social') ? ConnectorType.Social : ConnectorType.SMS,
  };

  return { connector, metadata, getAuthorizationUri };
});
jest.mock('@/connectors', () => ({
  getSocialConnectorInstanceById: async (connectorId: string) => {
    const connectorInstance = await getConnectorInstanceById(connectorId);

    if (connectorInstance.metadata.type !== ConnectorType.Social) {
      throw new RequestError({
        code: 'entity.not_found',
        status: 404,
      });
    }

    return connectorInstance;
  },
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
        ctx.userLog = {};

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
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'notexistuser',
        password: 'password',
      });
      expect(response.statusCode).toEqual(404);
    });

    it('throw if user found but wrong password', async () => {
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'username',
        password: '_password',
      });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/sign-in/passwordless/sms/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    it('it should call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/send-passcode')
        .send({ phone: '13000000000' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if phone does not exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/send-passcode')
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/sms/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/verify-passcode')
        .send({ phone: '13000000000', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'id' } }),
        expect.anything()
      );
    });
    it('throw error if phone does not exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/verify-passcode')
        .send({ phone: '13000000001', code: '1234' });
      expect(response.statusCode).toEqual(422);
    });
    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/verify-passcode')
        .send({ phone: '13000000000', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/sign-in/passwordless/email/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValue({
        jti: 'jti',
      });
    });
    it('it should call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'a@a.com' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if email does not exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/email/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/verify-passcode')
        .send({ email: 'a@a.com', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'id' } }),
        expect.anything()
      );
    });
    it('throw error if email does not exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });
    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/verify-passcode')
        .send({ email: 'a@a.com', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/sign-in/social', () => {
    it('should throw when redirectURI is invalid', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: 'social_enabled',
        state: 'state',
        redirectUri: 'logto.dev',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('sign-in with social and redirect', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: 'social_enabled',
        state: 'state',
        redirectUri: 'https://logto.dev',
      });
      expect(response.body).toHaveProperty('redirectTo', '');
    });

    it('throw error when sign-in with social but miss state', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: 'social_enabled',
        redirectUri: 'https://logto.dev',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when sign-in with social but miss redirectUri', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: 'social_enabled',
        state: 'state',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when connector is disabled', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: 'social_disabled',
        state: 'state',
        redirectUri: 'https://logto.dev',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when no social connector is found', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: 'others',
        state: 'state',
        redirectUri: 'https://logto.dev',
      });
      expect(response.statusCode).toEqual(404);
    });

    it('throw error when auth code is wrong', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: 'connectorId',
        state: 'state',
        redirectUri: 'https://logto.dev',
        code: '123455',
      });
      expect(response.statusCode).toEqual(500);
    });

    it('throw error when code is provided but connector can not be found', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: '_connectorId',
        state: 'state',
        redirectUri: 'https://logto.dev',
        code: '123456',
      });
      expect(response.statusCode).toEqual(422);
    });

    it('get and add user info with auth code, as well as assign result and redirect', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: 'connectorId',
        state: 'state',
        redirectUri: 'https://logto.dev',
        code: '123456',
      });
      expect(updateUserById).toHaveBeenCalledWith(
        'id',
        expect.objectContaining({
          identities: { connectorId: { userId: 'id', details: { id: 'id' } } },
        })
      );
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'id' } }),
        expect.anything()
      );
    });

    it('throw error when identity exists', async () => {
      const response = await sessionRequest.post('/session/sign-in/social').send({
        connectorId: '_connectorId_',
        state: 'state',
        redirectUri: 'https://logto.dev',
        code: '123456',
      });
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ connectorId: '_connectorId_', userInfo: { id: 'id' } }),
        expect.anything()
      );
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/bind-social-related-user', () => {
    it('throw if session is not authorized', async () => {
      await expect(
        sessionRequest
          .post('/session/sign-in/bind-social-related-user')
          .send({ connectorId: 'connectorId' })
      ).resolves.toHaveProperty('statusCode', 400);
    });
    it('throw if no social info in session', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: { login: { accountId: 'user1' } },
      });
      await expect(
        sessionRequest
          .post('/session/sign-in/bind-social-related-user')
          .send({ connectorId: 'connectorId' })
      ).resolves.toHaveProperty('statusCode', 400);
    });
    it('updates user identities and sign in', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          login: { accountId: 'user1' },
          socialUserInfo: {
            connectorId: 'connectorId',
            userInfo: { id: 'connectorUser', phone: 'phone' },
          },
        },
      });
      const response = await sessionRequest.post('/session/sign-in/bind-social-related-user').send({
        connectorId: 'connectorId',
      });
      expect(response.statusCode).toEqual(200);
      expect(updateUserById).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          identities: {
            connectorId: {
              details: { id: 'connectorUser', phone: 'phone' },
              userId: 'connectorUser',
            },
          },
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
  });

  describe('POST /session/register/username-password', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/register/username-password')
        .send({ username: 'username', password: 'password' });
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user1',
          username: 'username',
          passwordEncrypted: 'user1_password_user1',
          passwordEncryptionMethod: 'SaltAndPepper',
          passwordEncryptionSalt: 'user1',
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

    it('throw error if username not valid', async () => {
      const response = await sessionRequest
        .post('/session/register/username-password')
        .send({ username: '_', password: 'password' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if username exists', async () => {
      const response = await sessionRequest
        .post('/session/register/username-password')
        .send({ username: 'username1', password: 'password' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('GET /session/register/:username/existence', () => {
    it('property existence is false in response if username exists', async () => {
      const response = await sessionRequest.get('/session/register/username/existence');
      expect(response.body).toHaveProperty('existence', false);
    });

    it('throw error if username not valid', async () => {
      const response = await sessionRequest.get('/session/register/_u/existence');
      expect(response.statusCode).toEqual(400);
    });

    it('property existence is true in response if username exists', async () => {
      const response = await sessionRequest.get('/session/register/username1/existence');
      expect(response.body).toHaveProperty('existence', true);
    });
  });

  describe('POST /session/register/passwordless/sms/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });

    it('it should call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/send-passcode')
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });

    it('throw error if phone not valid (charactors other than digits)', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/send-passcode')
        .send({ phone: '1300000000a' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone not valid (not exactly 11-digits)', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/send-passcode')
        .send({ phone: '1300000000' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone exists', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/send-passcode')
        .send({ phone: '13000000000' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/sms/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '13000000001', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user1', primaryPhone: '13000000001' })
      );
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('throw error if phone not valid (characters other than digits)', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '1300000000a', code: '1234' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone not valid (not exactly 11-digits)', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '1300000000', code: '1234' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone exists', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '13000000000', code: '1234' });
      expect(response.statusCode).toEqual(422);
    });

    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '13000000001', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/register/passwordless/email/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });

    it('it should call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });

    it('throw error if email not valid', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/email/send-passcode')
        .send({ email: 'aaa.com' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if email exists', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/email/send-passcode')
        .send({ email: 'a@a.com' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/email/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/email/verify-passcode')
        .send({ email: 'b@a.com', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user1', primaryEmail: 'b@a.com' })
      );
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('throw error if email not valid', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'aaa.com' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if email exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });

    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/verify-passcode')
        .send({ email: 'a@a.com', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/register/social', () => {
    it('register with social, assign result and redirect', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          socialUserInfo: { connectorId: 'connectorId', userInfo: { id: 'user1' } },
        },
      });
      const response = await sessionRequest
        .post('/session/register/social')
        .send({ connectorId: 'connectorId' });
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user1',
          identities: { connectorId: { userId: 'user1', details: { id: 'user1' } } },
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

    it('throw error if no result can be found in interactionResults', async () => {
      interactionDetails.mockResolvedValueOnce({});
      const response = await sessionRequest
        .post('/session/register/social')
        .send({ connectorId: 'connectorId' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if result parsing fails', async () => {
      interactionDetails.mockResolvedValueOnce({ result: { login: { accountId: 'id' } } });
      const response = await sessionRequest
        .post('/session/register/social')
        .send({ connectorId: 'connectorId' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when user with identity exists', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          login: { accountId: 'user1' },
          socialUserInfo: { connectorId: 'connectorId', userInfo: { id: 'id' } },
        },
      });
      const response = await sessionRequest
        .post('/session/register/social')
        .send({ connectorId: 'connectorId' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/bind-social', () => {
    it('throw if session is not authorized', async () => {
      interactionDetails.mockResolvedValueOnce({});
      await expect(
        sessionRequest.post('/session/bind-social').send({ connectorId: 'connectorId' })
      ).resolves.toHaveProperty('statusCode', 400);
    });
    it('throw if no social info in session', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: { login: { accountId: 'user1' } },
      });
      await expect(
        sessionRequest.post('/session/bind-social').send({ connectorId: 'connectorId' })
      ).resolves.toHaveProperty('statusCode', 400);
    });
    it('updates user identities', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          login: { accountId: 'user1' },
          socialUserInfo: {
            connectorId: 'connectorId',
            userInfo: { id: 'connectorUser', phone: 'phone' },
          },
        },
      });
      const response = await sessionRequest.post('/session/bind-social').send({
        connectorId: 'connectorId',
      });
      expect(response.statusCode).toEqual(200);
      expect(updateUserById).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          identities: {
            connectorId: {
              details: { id: 'connectorUser', phone: 'phone' },
              userId: 'connectorUser',
            },
          },
        })
      );
    });
  });

  describe('POST /session/consent', () => {
    describe('should call grant.save() and assign interaction results', () => {
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
      interactionDetails.mockResolvedValueOnce({});
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
/* eslint-enable max-lines */
