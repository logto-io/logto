import { ConnectorType } from '@logto/connector-kit';
import type { User } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { mockLogtoConnectorList, mockSignInExperience, mockUser } from '#src/__mocks__/index.js';
import { getLogtoConnectorById } from '#src/connectors/index.js';
import type { SocialUserInfo } from '#src/connectors/types.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createRequester } from '#src/utils/test-utils.js';

import socialRoutes, { signInRoute } from './social.js';

const findSocialRelatedUser = jest.fn(async () => [
  'phone',
  { id: 'user1', identities: {}, isSuspended: false },
]);

const getUserInfoByAuthCode = jest.fn(
  async (connectorId: string, data: { code: string }): Promise<SocialUserInfo> => {
    if (connectorId === '_connectorId') {
      throw new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        connectorId,
      });
    }

    if (data.code === '123456') {
      return { id: mockUser.id };
    }

    // This mocks the case that can not get userInfo with access token and auth code
    // (most likely third-party social connectors' problem).
    throw new Error(' ');
  }
);

jest.mock('#src/libraries/social.js', () => ({
  ...jest.requireActual('#src/libraries/social.js'),
  findSocialRelatedUser: async () => findSocialRelatedUser(),
  getUserInfoByAuthCode: async (connectorId: string, data: { code: string }) =>
    getUserInfoByAuthCode(connectorId, data),
}));
const insertUser = jest.fn(async (..._args: unknown[]) => mockUser);
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => mockUser);
const findUserByIdentity = jest.fn().mockResolvedValue(mockUser);

jest.mock('#src/queries/user.js', () => ({
  findUserById: async () => findUserById(),
  findUserByIdentity: async () => findUserByIdentity(),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUserWithIdentity: async (target: string, userId: string) =>
    target === 'connectorTarget' && userId === mockUser.id,
}));

jest.mock('#src/libraries/user.js', () => ({
  generateUserId: () => 'user1',
  insertUser: async (...args: unknown[]) => insertUser(...args),
}));

jest.mock('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: async () => ({
    ...mockSignInExperience,
    signUp: {
      ...mockSignInExperience.signUp,
      identifiers: [],
    },
  }),
}));

const getLogtoConnectorByIdHelper = jest.fn(async (connectorId: string) => {
  const database = {
    enabled: connectorId === 'social_enabled',
  };
  const metadata = {
    id:
      connectorId === 'social_enabled'
        ? 'social_enabled'
        : connectorId === 'social_disabled'
        ? 'social_disabled'
        : 'others',
  };

  return {
    dbEntry: database,
    metadata,
    type: connectorId.startsWith('social') ? ConnectorType.Social : ConnectorType.Sms,
    getAuthorizationUri: jest.fn(async () => ''),
  };
});

jest.mock('#src/connectors.js', () => ({
  getLogtoConnectors: jest.fn(async () => mockLogtoConnectorList),
  getLogtoConnectorById: jest.fn(async (connectorId: string) => {
    const connector = await getLogtoConnectorByIdHelper(connectorId);

    if (connector.type !== ConnectorType.Social) {
      throw new RequestError({
        code: 'entity.not_found',
        status: 404,
      });
    }

    return connector;
  }),
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

describe('session -> socialRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: socialRoutes,
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
      const response = await sessionRequest.post(`${signInRoute}`).send({
        connectorId: 'social_enabled',
        state: 'state',
        redirectUri: 'logto.dev',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('sign-in with social and redirect', async () => {
      const response = await sessionRequest.post(`${signInRoute}`).send({
        connectorId: 'social_enabled',
        state: 'state',
        redirectUri: 'https://logto.dev',
      });
      expect(response.body).toHaveProperty('redirectTo', '');
    });

    it('throw error when sign-in with social but miss state', async () => {
      const response = await sessionRequest.post(`${signInRoute}`).send({
        connectorId: 'social_enabled',
        redirectUri: 'https://logto.dev',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when sign-in with social but miss redirectUri', async () => {
      const response = await sessionRequest.post(`${signInRoute}`).send({
        connectorId: 'social_enabled',
        state: 'state',
      });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when no social connector is found', async () => {
      const response = await sessionRequest.post(`${signInRoute}`).send({
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
      (getLogtoConnectorById as jest.Mock).mockResolvedValueOnce({
        metadata: { target: connectorTarget },
        dbEntry: { syncProfile: false },
      });
      const response = await sessionRequest.post(`${signInRoute}/auth`).send({
        connectorId: 'connectorId',
        state: 'state',
        redirectUri: 'https://logto.dev',
        code: '123455',
      });
      expect(response.statusCode).toEqual(500);
    });

    it('throw error when code is provided but connector can not be found', async () => {
      (getLogtoConnectorById as jest.Mock).mockResolvedValueOnce({
        metadata: { target: connectorTarget },
        dbEntry: { syncProfile: false },
      });
      const response = await sessionRequest.post(`${signInRoute}/auth`).send({
        connectorId: '_connectorId',
        state: 'state',
        redirectUri: 'https://logto.dev',
        code: '123456',
      });
      expect(response.statusCode).toEqual(422);
    });

    it('get and add user info with auth code, as well as assign result and redirect', async () => {
      (getLogtoConnectorById as jest.Mock).mockResolvedValueOnce({
        metadata: { target: connectorTarget },
        dbEntry: { syncProfile: false },
      });
      const response = await sessionRequest.post(`${signInRoute}/auth`).send({
        connectorId: 'connectorId',
        data: {
          state: 'state',
          redirectUri: 'https://logto.dev',
          code: '123456',
        },
      });
      expect(updateUserById).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          identities: {
            ...mockUser.identities,
            connectorTarget: { userId: mockUser.id, details: { id: mockUser.id } },
          },
        })
      );
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: mockUser.id } }),
        expect.anything()
      );
    });

    it('throw error when user is suspended', async () => {
      (getLogtoConnectorById as jest.Mock).mockResolvedValueOnce({
        metadata: { target: connectorTarget },
        dbEntry: { syncProfile: false },
      });
      findUserByIdentity.mockResolvedValueOnce({
        ...mockUser,
        isSuspended: true,
      });
      const response = await sessionRequest.post(`${signInRoute}/auth`).send({
        connectorId: 'connectorId',
        data: {
          state: 'state',
          redirectUri: 'https://logto.dev',
          code: '123456',
        },
      });
      expect(response.statusCode).toEqual(401);
    });

    it('throw error when identity exists', async () => {
      findUserByIdentity.mockResolvedValueOnce(null);
      (getLogtoConnectorById as jest.Mock).mockResolvedValueOnce({
        metadata: { target: connectorTarget },
        dbEntry: { syncProfile: false },
      });
      const response = await sessionRequest.post(`${signInRoute}/auth`).send({
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
          socialUserInfo: { connectorId: '_connectorId_', userInfo: { id: mockUser.id } },
        }),
        expect.anything()
      );
      expect(response.statusCode).toEqual(422);
    });

    it('should update `name` and `avatar` if exists when `syncProfile` is set to be true', async () => {
      (getLogtoConnectorById as jest.Mock).mockResolvedValueOnce({
        metadata: { target: connectorTarget },
        dbEntry: { syncProfile: true },
      });
      findUserByIdentity.mockResolvedValueOnce(mockUser);
      getUserInfoByAuthCode.mockResolvedValueOnce({
        ...mockUser,
        name: 'new_name',
        avatar: 'new_avatar',
      });
      await sessionRequest.post(`${signInRoute}/auth`).send({
        connectorId: 'connectorId',
        data: {
          state: 'state',
          redirectUri: 'https://logto.dev',
          code: '123456',
        },
      });
      expect(updateUserById).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ name: 'new_name', avatar: 'new_avatar' })
      );
    });

    it('should not update `name` and `avatar` if exists when `syncProfile` is set to be false', async () => {
      (getLogtoConnectorById as jest.Mock).mockResolvedValueOnce({
        metadata: { target: connectorTarget },
        dbEntry: { syncProfile: true },
      });
      findUserByIdentity.mockResolvedValueOnce(mockUser);
      getUserInfoByAuthCode.mockResolvedValueOnce({
        ...mockUser,
        name: 'new_name',
        avatar: 'new_avatar',
      });
      await sessionRequest.post(`${signInRoute}/auth`).send({
        connectorId: 'connectorId',
        data: {
          state: 'state',
          redirectUri: 'https://logto.dev',
          code: '123456',
        },
      });
      expect(updateUserById).not.toHaveBeenCalledWith(mockUser.id, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        identities: expect.anything(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        lastSignInAt: expect.anything(),
      });
    });
  });

  describe('POST /session/sign-in/bind-social-related-user', () => {
    beforeEach(() => {
      const mockGetLogtoConnectorById = getLogtoConnectorById as jest.Mock;
      mockGetLogtoConnectorById.mockResolvedValueOnce({
        metadata: { target: 'connectorTarget' },
      });
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
    it('throw error when user is suspended', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          login: { accountId: 'user1' },
          socialUserInfo: {
            connectorId: 'connectorId',
            userInfo: { id: 'connectorUser', phone: 'phone' },
          },
        },
      });
      findSocialRelatedUser.mockResolvedValueOnce([
        'phone',
        {
          ...mockUser,
          isSuspended: true,
        },
      ]);
      const response = await sessionRequest.post('/session/sign-in/bind-social-related-user').send({
        connectorId: 'connectorId',
      });
      expect(response.statusCode).toEqual(401);
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
});
