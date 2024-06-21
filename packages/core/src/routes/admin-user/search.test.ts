import type { CreateUser, Role, User } from '@logto/schemas';
import { userInfoSelectFields, RoleType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { pick, removeUndefinedKeys } from '@silverhand/essentials';

import { mockUser, mockUserList, mockUserListResponse } from '#src/__mocks__/index.js';
import { type InsertUserResult } from '#src/libraries/user.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const filterUsersWithSearch = (users: User[], search: string) =>
  users.filter((user) =>
    [user.username, user.primaryEmail, user.primaryPhone, user.name].some((value) =>
      value ? !value.includes(search) : false
    )
  );

const mockedQueries = {
  users: {
    countUsers: jest.fn(async ({ search }) => ({
      count: search
        ? filterUsersWithSearch(mockUserList, String(search)).length
        : mockUserList.length,
    })),
    findUsers: jest.fn(
      async (limit, offset, { search }): Promise<User[]> =>
        search ? filterUsersWithSearch(mockUserList, String(search)) : mockUserList
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

describe('adminUserRoutes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, undefined, {
    users: usersLibraries,
  });
  const userRequest = createRequester({ authedRoutes: adminUserRoutes, tenantContext });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users', async () => {
    const response = await userRequest.get('/users');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockUserListResponse);
    expect(response.header).toHaveProperty('total-number', `${mockUserList.length}`);
  });

  it('GET /users should return matched data', async () => {
    const search = 'foo';
    const response = await userRequest.get('/users').send({ search });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      filterUsersWithSearch(mockUserList, search).map((user) => pick(user, ...userInfoSelectFields))
    );
    expect(response.header).toHaveProperty(
      'total-number',
      `${filterUsersWithSearch(mockUserList, search).length}`
    );
  });
});
