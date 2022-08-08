import { User } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { mockUser, mockConnectorInstances } from '@/__mocks__';
import { getConnectorInstanceById } from '@/connectors';
import { ConnectorType } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import { createRequester } from '@/utils/test-utils';

import sessionSocialRoutes from './social';

jest.mock('@/lib/user', () => ({
  generateUserId: () => 'user1',
  updateLastSignInAt: async (...args: unknown[]) => updateUserById(...args),
}));
jest.mock('@/lib/social', () => ({
  ...jest.requireActual('@/lib/social'),
  async findSocialRelatedUser() {
    return ['phone', { id: 'user1', identities: {} }];
  },
  async getUserInfoByAuthCode(connectorId: string, data: { code: string }) {
    if (connectorId === '_connectorId') {
      throw new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        connectorId,
      });
    }

    if (data.code === '123456') {
      return { id: 'id' };
    }

    // This mocks the case that can not get userInfo with access token and auth code
    // (most likely third-party social connectors' problem).
    throw new Error(' ');
  },
}));
const insertUser = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
jest.mock('@/queries/user', () => ({
  findUserById: async () => findUserById(),
  findUserByIdentity: async () => ({ id: 'id', identities: {} }),
  insertUser: async (...args: unknown[]) => insertUser(...args),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUserWithIdentity: async (target: string, userId: string) =>
    target === 'connectorTarget' && userId === 'id',
}));
const getConnectorInstanceByIdHelper = jest.fn(async (connectorId: string) => {
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

  return { connector, instance: { metadata, getAuthorizationUri: jest.fn(async () => '') } };
});
jest.mock('@/connectors', () => ({
  getSocialConnectorInstanceById: async (connectorId: string) => {
    const connectorInstance = await getConnectorInstanceByIdHelper(connectorId);

    if (connectorInstance.instance.metadata.type !== ConnectorType.Social) {
      throw new RequestError({
        code: 'entity.not_found',
        status: 404,
      });
    }

    return connectorInstance;
  },
  getConnectorInstances: jest.fn(async () => mockConnectorInstances),
  getConnectorInstanceById: jest.fn(),
}));

const interactionResult = jest.fn(async () => 'redirectTo');
const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
    interactionResult,
  })),
}));

afterEach(() => {
  interactionResult.mockClear();
});

describe('sessionSocialRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: sessionSocialRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
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
  });

  describe('POST /session/sign-in/social/auth', () => {
    const connectorTarget = 'connectorTarget';
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throw error when auth code is wrong', async () => {
      (getConnectorInstanceById as jest.Mock).mockResolvedValueOnce({
        instance: { metadata: { target: connectorTarget } },
      });
      const response = await sessionRequest.post('/session/sign-in/social/auth').send({
        connectorId: 'connectorId',
        state: 'state',
        redirectUri: 'https://logto.dev',
        code: '123455',
      });
      expect(response.statusCode).toEqual(500);
    });

    it('throw error when code is provided but connector can not be found', async () => {
      (getConnectorInstanceById as jest.Mock).mockResolvedValueOnce({
        instance: { metadata: { target: connectorTarget } },
      });
      const response = await sessionRequest.post('/session/sign-in/social/auth').send({
        connectorId: '_connectorId',
        state: 'state',
        redirectUri: 'https://logto.dev',
        code: '123456',
      });
      expect(response.statusCode).toEqual(422);
    });

    it('get and add user info with auth code, as well as assign result and redirect', async () => {
      (getConnectorInstanceById as jest.Mock).mockResolvedValueOnce({
        instance: { metadata: { target: connectorTarget } },
      });
      const response = await sessionRequest.post('/session/sign-in/social/auth').send({
        connectorId: 'connectorId',
        data: {
          state: 'state',
          redirectUri: 'https://logto.dev',
          code: '123456',
        },
      });
      expect(updateUserById).toHaveBeenCalledWith(
        'id',
        expect.objectContaining({
          identities: { connectorTarget: { userId: 'id', details: { id: 'id' } } },
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
      const wrongConnectorTarget = 'wrongConnectorTarget';
      (getConnectorInstanceById as jest.Mock).mockResolvedValueOnce({
        instance: { metadata: { target: wrongConnectorTarget } },
      });
      const response = await sessionRequest.post('/session/sign-in/social/auth').send({
        connectorId: '_connectorId_',
        data: {
          state: 'state',
          redirectUri: 'https://logto.dev',
          code: '123456',
        },
      });
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          socialUserInfo: { connectorId: '_connectorId_', userInfo: { id: 'id' } },
        }),
        expect.anything()
      );
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/bind-social-related-user', () => {
    beforeEach(() => {
      const mockGetConnectorInstanceById = getConnectorInstanceById as jest.Mock;
      mockGetConnectorInstanceById.mockResolvedValueOnce({
        instance: { metadata: { target: 'connectorTarget' } },
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
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
            connectorTarget: {
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

  describe('POST /session/register/social', () => {
    beforeEach(() => {
      const mockGetConnectorInstanceById = getConnectorInstanceById as jest.Mock;
      mockGetConnectorInstanceById.mockResolvedValueOnce({
        instance: { metadata: { target: 'connectorTarget' } },
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('register with social, assign result and redirect', async () => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
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
          identities: { connectorTarget: { userId: 'user1', details: { id: 'user1' } } },
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
    beforeEach(() => {
      const mockGetConnectorInstanceById = getConnectorInstanceById as jest.Mock;
      mockGetConnectorInstanceById.mockResolvedValueOnce({
        instance: { metadata: { target: 'connectorTarget' } },
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
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
        jti: 'jti',
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
            connectorTarget: {
              details: { id: 'connectorUser', phone: 'phone' },
              userId: 'connectorUser',
            },
            connector1: { userId: 'connector1', details: {} },
          },
        })
      );
    });
  });
});
