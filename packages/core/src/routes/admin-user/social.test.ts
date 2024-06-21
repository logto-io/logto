import { ConnectorType, type CreateUser, type User } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { removeUndefinedKeys } from '@silverhand/essentials';

import {
  mockConnector0,
  mockLogtoConnector,
  mockLogtoConnectorList,
  mockMetadata0,
} from '#src/__mocks__/index.js';
import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type InsertUserResult } from '#src/libraries/user.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const notExistedUserId = 'notExistedUserId';

const newTarget = 'newTarget';
const newIdentity = {
  userId: 'newUserId',
};

const mockHasUserWithIdentity = jest.fn(async () => false);
const mockedQueries = {
  users: {
    findUserById: jest.fn(async (id: string) => {
      if (id === notExistedUserId) {
        throw new RequestError({ code: 'entity.not_exists', status: 404 });
      }
      return mockUser;
    }),
    updateUserById: jest.fn(
      async (_, data: Partial<CreateUser>): Promise<User> => ({
        ...mockUser,
        ...data,
      })
    ),
    hasUserWithIdentity: mockHasUserWithIdentity,
    deleteUserById: jest.fn(),
    deleteUserIdentity: jest.fn(),
  },
} satisfies Partial2<Queries>;

const usersLibraries = {
  generateUserId: jest.fn(async () => 'fooId'),
  insertUser: jest.fn(
    async (user: CreateUser): Promise<InsertUserResult> => [
      {
        ...mockUser,
        ...removeUndefinedKeys(user), // No undefined values will be returned from database
      },
    ]
  ),
} satisfies Partial<Libraries['users']>;

const mockGetLogtoConnectors = jest.fn(async () => mockLogtoConnectorList);
const mockedConnectors = {
  getLogtoConnectors: mockGetLogtoConnectors,
  getLogtoConnectorById: async (connectorId: string) => {
    const connectors = await mockGetLogtoConnectors();
    const connector = connectors.find(({ dbEntry }) => dbEntry.id === connectorId);
    assertThat(
      connector,
      new RequestError({
        code: 'entity.not_found',
        connectorId,
        status: 404,
      })
    );

    return connector;
  },
};

const { findUserById, updateUserById, deleteUserIdentity } = mockedQueries.users;

const adminUserSocialRoutes = await pickDefault(import('./social.js'));

describe('Admin user social identities APIs', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, mockedConnectors, {
    users: usersLibraries,
  });

  const userRequest = createRequester({ authedRoutes: adminUserSocialRoutes, tenantContext });

  describe('PUT /users/:userId/identities/:target', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw if user cannot be found', async () => {
      await expect(
        userRequest.put(`/users/${notExistedUserId}/identities/${newTarget}`).send(newIdentity)
      ).resolves.toHaveProperty('status', 404);
      expect(updateUserById).not.toHaveBeenCalled();
    });

    it('should throw if user already has the social identity', async () => {
      mockHasUserWithIdentity.mockResolvedValueOnce(true);
      const mockedFindUserById = findUserById as jest.Mock;
      mockedFindUserById.mockImplementationOnce(() => ({
        ...mockUser,
        identities: {},
      }));
      await expect(
        userRequest.put(`/users/foo/identities/${newTarget}`).send(newIdentity)
      ).resolves.toHaveProperty('status', 422);
      expect(updateUserById).not.toHaveBeenCalled();
    });

    it('should update user with new social identity (response status 200)', async () => {
      const mockedFindUserById = findUserById as jest.Mock;
      mockedFindUserById.mockImplementationOnce(() => ({
        ...mockUser,
        identities: { [newTarget]: { userId: 'socialIdForTarget1' } },
      }));
      await expect(
        userRequest.put(`/users/foo/identities/${newTarget}`).send(newIdentity)
      ).resolves.toHaveProperty('status', 200);
      expect(updateUserById).toHaveBeenCalledWith('foo', {
        identities: {
          [newTarget]: newIdentity,
        },
      });
    });

    it('should add new social identity to the user (response status 201)', async () => {
      const mockedFindUserById = findUserById as jest.Mock;
      mockedFindUserById.mockImplementationOnce(() => ({
        ...mockUser,
        identities: { connectorTarget1: { userId: 'socialIdForTarget1' } },
      }));
      await expect(
        userRequest.put(`/users/foo/identities/${newTarget}`).send(newIdentity)
      ).resolves.toHaveProperty('status', 201);
      expect(updateUserById).toHaveBeenCalledWith('foo', {
        identities: {
          connectorTarget1: { userId: 'socialIdForTarget1' },
          [newTarget]: newIdentity,
        },
      });
    });
  });

  describe('POST /users/:userId/identities', () => {
    it('should throw if user cannot be found', async () => {
      // Mock connector with id 'id0' is declared in mockLogtoConnectorList
      await expect(
        userRequest
          .post(`/users/${notExistedUserId}/identities`)
          .send({ connectorId: 'id0', connectorData: { code: 'random_code' } })
      ).resolves.toHaveProperty('status', 404);
      expect(updateUserById).not.toHaveBeenCalled();
    });

    it('should throw if user is found but connector cannot be found', async () => {
      const nonExistConnectorId = 'non_exist_connector_id';
      await expect(
        userRequest
          .post(`/users/foo/identities`)
          .send({ connectorId: nonExistConnectorId, connectorData: { code: 'random_code' } })
      ).resolves.toHaveProperty('status', 404);
      expect(updateUserById).not.toHaveBeenCalled();
    });

    it('should throw if connector type is not social', async () => {
      // Mock connector with id 'id1' is declared in mockLogtoConnectorList, whose type is sms (not social)
      await expect(
        userRequest
          .post(`/users/foo/identities`)
          .send({ connectorId: 'id1', connectorData: { code: 'random_code' } })
      ).resolves.toHaveProperty('status', 422);
      expect(updateUserById).not.toHaveBeenCalled();
    });

    it('should throw if user already has the social identity', async () => {
      mockHasUserWithIdentity.mockResolvedValueOnce(true);
      mockGetLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: mockConnector0,
          metadata: { ...mockMetadata0 },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
          getAuthorizationUri: async () => 'http://example.com',
          getUserInfo: async () => ({ id: 'foo' }),
        },
      ]);
      const mockedFindUserById = findUserById as jest.Mock;
      mockedFindUserById.mockImplementationOnce(() => ({
        ...mockUser,
        identities: { connector_0: {} }, // This value 'connector_0' is declared in mockLogtoConnectorList
      }));
      await expect(
        userRequest
          .post(`/users/foo/identities`)
          .send({ connectorId: 'id0', connectorData: { code: 'random_code' } })
      ).resolves.toHaveProperty('status', 422);
      expect(updateUserById).not.toHaveBeenCalled();
    });

    it('should update user with new social identity', async () => {
      const mockedSocialUserInfo = { id: 'socialId' };
      mockGetLogtoConnectors.mockResolvedValueOnce([
        {
          dbEntry: mockConnector0,
          metadata: { ...mockMetadata0 },
          type: ConnectorType.Social,
          ...mockLogtoConnector,
          getAuthorizationUri: async () => 'http://example.com',
          getUserInfo: async () => mockedSocialUserInfo,
        },
      ]);
      const mockedFindUserById = findUserById as jest.Mock;
      mockedFindUserById.mockImplementationOnce(() => ({
        ...mockUser,
        identities: { connectorTarget1: { userId: 'socialIdForTarget1' } },
      }));
      await expect(
        userRequest
          .post(`/users/foo/identities`)
          .send({ connectorId: 'id0', connectorData: { code: 'random_code' } })
      ).resolves.toHaveProperty('status', 200);
      expect(updateUserById).toHaveBeenCalledWith('foo', {
        identities: {
          connectorTarget1: { userId: 'socialIdForTarget1' },
          connector_0: { userId: 'socialId', details: mockedSocialUserInfo },
        },
      });
    });
  });

  describe('DELETE /users/:userId/identities/:target', () => {
    it('should throw if user cannot be found', async () => {
      const arbitraryTarget = 'arbitraryTarget';
      await expect(
        userRequest.delete(`/users/foo/identities/${arbitraryTarget}`)
      ).resolves.toHaveProperty('status', 404);
      expect(deleteUserIdentity).not.toHaveBeenCalled();
    });

    it('should throw if user is found but connector cannot be found', async () => {
      const arbitraryUserId = 'arbitraryUserId';
      const nonExistedTarget = 'nonExistedTarget';
      const mockedFindUserById = findUserById as jest.Mock;
      mockedFindUserById.mockImplementationOnce((userId) => {
        if (userId === arbitraryUserId) {
          return { identities: { connector1: {}, connector2: {} } };
        }
      });
      await expect(
        userRequest.delete(`/users/${arbitraryUserId}/identities/${nonExistedTarget}`)
      ).resolves.toHaveProperty('status', 404);
      expect(deleteUserIdentity).not.toHaveBeenCalled();
    });

    it('should delete identity from user', async () => {
      const arbitraryUserId = 'arbitraryUserId';
      const arbitraryTarget = 'arbitraryTarget';
      const mockedFindUserById = findUserById as jest.Mock;
      mockedFindUserById.mockImplementationOnce((userId) => {
        if (userId === arbitraryUserId) {
          return {
            identities: { connectorTarget1: {}, connectorTarget2: {}, arbitraryTarget: {} },
          };
        }
      });
      await userRequest.delete(`/users/${arbitraryUserId}/identities/${arbitraryTarget}`);
      expect(deleteUserIdentity).toHaveBeenCalledWith(arbitraryUserId, arbitraryTarget);
    });
  });
});
