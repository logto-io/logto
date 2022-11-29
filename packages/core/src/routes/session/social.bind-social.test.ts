import { ConnectorType } from '@logto/connector-kit';
import type { User } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { mockLogtoConnectorList, mockSignInExperience, mockUser } from '#src/__mocks__/index.js';
import { getLogtoConnectorById } from '#src/connectors/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createRequester } from '#src/utils/test-utils.js';

import socialRoutes, { registerRoute } from './social.js';

const findSocialRelatedUser = jest.fn(async () => [
  'phone',
  { id: 'user1', identities: {}, isSuspended: false },
]);
jest.mock('#src/lib/social.js', () => ({
  ...jest.requireActual('#src/lib/social.js'),
  findSocialRelatedUser: async () => findSocialRelatedUser(),
  async getUserInfoByAuthCode(connectorId: string, data: { code: string }) {
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
  },
}));
const insertUser = jest.fn(async (..._args: unknown[]) => mockUser);
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => mockUser);
const findUserByIdentity = jest.fn(async () => mockUser);

jest.mock('#src/queries/user.js', () => ({
  findUserById: async () => findUserById(),
  findUserByIdentity: async () => findUserByIdentity(),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUserWithIdentity: async (target: string, userId: string) =>
    target === 'connectorTarget' && userId === mockUser.id,
}));

jest.mock('#src/lib/user.js', () => ({
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

  describe('POST /session/register/social', () => {
    beforeEach(() => {
      const mockGetLogtoConnectorById = getLogtoConnectorById as jest.Mock;
      mockGetLogtoConnectorById.mockResolvedValueOnce({
        metadata: { target: 'connectorTarget' },
      });
    });

    it('register with social, assign result and redirect', async () => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
        result: {
          socialUserInfo: { connectorId: 'connectorId', userInfo: { id: 'user1' } },
        },
      });
      const response = await sessionRequest
        .post(`${registerRoute}`)
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
        .post(`${registerRoute}`)
        .send({ connectorId: 'connectorId' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if result parsing fails', async () => {
      interactionDetails.mockResolvedValueOnce({ result: { login: { accountId: mockUser.id } } });
      const response = await sessionRequest
        .post(`${registerRoute}`)
        .send({ connectorId: 'connectorId' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error when user with identity exists', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          login: { accountId: 'user1' },
          socialUserInfo: { connectorId: 'connectorId', userInfo: { id: mockUser.id } },
        },
      });
      const response = await sessionRequest
        .post(`${registerRoute}`)
        .send({ connectorId: 'connectorId' });
      expect(response.statusCode).toEqual(400);
    });
  });
});
