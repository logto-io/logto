import type { CreateUser, Role, User } from '@logto/schemas';
import { RoleType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { removeUndefinedKeys } from '@silverhand/essentials';

import { mockUser, mockUserList, mockUserListResponse } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { type InsertUserResult } from '#src/libraries/user.js';
import { type UserConditions } from '#src/queries/user.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

import { transpileUserProfileResponse } from '../../utils/user.js';

const { jest } = import.meta;

const filterUsersWithSearch = (users: User[], search: string) =>
  users.filter((user) =>
    [user.username, user.primaryEmail, user.primaryPhone, user.name].some((value) =>
      value ? !value.includes(search) : false
    )
  );

const getMockUsers = ({ search, identity }: UserConditions) => {
  if (identity) {
    return identity.identityId === 'not-found' ? [] : [mockUser];
  }

  return search ? filterUsersWithSearch(mockUserList, String(search)) : mockUserList;
};

const mockedQueries = {
  users: {
    countUsers: jest.fn(async (conditions: UserConditions) => ({
      count: getMockUsers(conditions).length,
    })),
    findUsers: jest.fn(
      async (_limit, _offset, conditions: UserConditions): Promise<User[]> =>
        getMockUsers(conditions)
    ),
  },
  roles: {
    findRolesByRoleNames: jest.fn(
      async (): Promise<Role[]> => [
        {
          tenantId: 'fake_tenant',
          id: 'role_id',
          name: 'admin',
          description: 'none',
          type: RoleType.User,
          isDefault: false,
        },
      ]
    ),
  },
  usersRoles: {
    deleteUsersRolesByUserIdAndRoleId: jest.fn(),
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

const adminUserRoutes = await pickDefault(import('./search.js'));
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

describe('adminUserRoutes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, undefined, {
    users: usersLibraries,
  });
  const userRequest = createRequester({ authedRoutes: adminUserRoutes, tenantContext });

  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('GET /users', async () => {
    const response = await userRequest.get('/users');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockUserListResponse);
    expect(response.header).toHaveProperty('total-number', `${mockUserList.length}`);
  });

  it('GET /users should not include passwordDigest/passwordAlgorithm by default', async () => {
    const response = await userRequest.get('/users');
    expect(response.status).toEqual(200);
    for (const user of response.body as unknown[]) {
      expect(user).not.toHaveProperty('passwordDigest');
      expect(user).not.toHaveProperty('passwordAlgorithm');
    }
  });

  it('GET /users with includePasswordHash=true should include passwordDigest and passwordAlgorithm for each user', async () => {
    const response = await userRequest.get('/users?includePasswordHash=true');
    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(mockUserList.length);
    for (const [index, user] of (response.body as unknown[]).entries()) {
      expect(user).toHaveProperty('passwordDigest', mockUserList[index]!.passwordEncrypted);
      expect(user).toHaveProperty(
        'passwordAlgorithm',
        mockUserList[index]!.passwordEncryptionMethod
      );
    }
  });

  it('GET /users should return matched data', async () => {
    const search = 'foo';
    const response = await userRequest.get('/users').send({ search });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      filterUsersWithSearch(mockUserList, search).map((user) => transpileUserProfileResponse(user))
    );
    expect(response.header).toHaveProperty(
      'total-number',
      `${filterUsersWithSearch(mockUserList, search).length}`
    );
  });

  it('GET /users should filter users by social identity', async () => {
    const identity = {
      type: 'social',
      provider: 'dingtalk',
      identityId: 'dingtalk-open-id',
    } as const;
    const response = await userRequest.get('/users').query({
      identityType: identity.type,
      identityProvider: identity.provider,
      identityId: identity.identityId,
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([transpileUserProfileResponse(mockUser)]);
    expect(response.header).toHaveProperty('total-number', '1');
    expect(mockedQueries.users.countUsers).toHaveBeenCalledWith(
      expect.objectContaining({ identity })
    );
    expect(mockedQueries.users.findUsers).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({ identity })
    );
  });

  it('GET /users should filter users by enterprise SSO identity', async () => {
    const identity = {
      type: 'sso',
      provider: 'https://example.com/issuer',
      identityId: 'enterprise-user-id',
    } as const;
    const response = await userRequest.get('/users').query({
      identityType: identity.type,
      identityProvider: identity.provider,
      identityId: identity.identityId,
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([transpileUserProfileResponse(mockUser)]);
    expect(mockedQueries.users.countUsers).toHaveBeenCalledWith(
      expect.objectContaining({ identity })
    );
  });

  it('GET /users should return an empty list when the external identity is not found', async () => {
    const response = await userRequest.get('/users').query({
      identityType: 'social',
      identityProvider: 'dingtalk',
      identityId: 'not-found',
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([]);
    expect(response.header).toHaveProperty('total-number', '0');
  });

  it('GET /users should combine identity lookup with existing search conditions', async () => {
    const response = await userRequest.get('/users').query({
      identityType: 'social',
      identityProvider: 'dingtalk',
      identityId: 'dingtalk-open-id',
      search: 'foo',
      excludeRoleId: 'role-id',
    });

    expect(response.status).toEqual(200);
    const conditions = mockedQueries.users.countUsers.mock.calls[0]?.[0];
    expect(conditions?.identity).toEqual({
      type: 'social',
      provider: 'dingtalk',
      identityId: 'dingtalk-open-id',
    });
    expect(conditions?.relation).toMatchObject({ value: 'role-id' });
    expect(conditions?.search?.matches).toHaveLength(1);
  });

  it.each([
    { identityType: 'social' },
    { identityType: 'social', identityProvider: 'dingtalk' },
    { identityProvider: 'dingtalk', identityId: 'dingtalk-open-id' },
    { identityType: '', identityProvider: 'dingtalk', identityId: 'dingtalk-open-id' },
  ])('GET /users should reject incomplete identity parameters: %p', async (query) => {
    const response = await userRequest.get('/users').query(query);

    expect(response.status).toEqual(400);
    expect(mockedQueries.users.countUsers).not.toHaveBeenCalled();
    expect(mockedQueries.users.findUsers).not.toHaveBeenCalled();
  });

  it('GET /users should reject an invalid identity type', async () => {
    const response = await userRequest.get('/users').query({
      identityType: 'oidc',
      identityProvider: 'https://example.com/issuer',
      identityId: 'enterprise-user-id',
    });

    expect(response.status).toEqual(400);
    expect(mockedQueries.users.countUsers).not.toHaveBeenCalled();
  });

  it('GET /users should reject identity lookup when dev features are disabled', async () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    const response = await userRequest.get('/users').query({
      identityType: 'social',
      identityProvider: 'dingtalk',
      identityId: 'dingtalk-open-id',
    });

    expect(response.status).toEqual(400);
    expect(mockedQueries.users.countUsers).not.toHaveBeenCalled();
  });
});
