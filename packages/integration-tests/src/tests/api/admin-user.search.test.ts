import type { Role, User } from '@logto/schemas';

import { assignRolesToUser, authedAdminApi, createUser, deleteUser } from '#src/api/index.js';
import { createRole, deleteRole } from '#src/api/role.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';

const getUsers = async <T>(
  init: string[][] | Record<string, string> | URLSearchParams
): Promise<{ headers: Headers; json: T }> => {
  const response = await authedAdminApi.get('users', {
    searchParams: new URLSearchParams(init),
  });

  return { headers: response.headers, json: (await response.json()) as T };
};

describe('admin console user search params', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let users: User[] = [];

  beforeAll(async () => {
    const prefix = `search_`;
    const rawNames = [
      'tom scott',
      'tom scott 2',
      'tom scott 3',
      'tom scott 4',
      'tom scott 5',
      'jerry swift',
      'jerry swift 1',
      'jerry swift jr',
      'jerry swift jr 2',
      'jerry swift jr jr',
    ];
    const emailSuffix = ['@gmail.com', '@foo.bar', '@geek.best'];

    // eslint-disable-next-line @silverhand/fp/no-mutation
    users = await Promise.all(
      rawNames.map(async (raw, index) => {
        const username = raw.split(' ').join('_');
        const name = raw
          .split(' ')
          .filter((segment) => Number.isNaN(Number(segment)))
          .map((segment) => segment[0]!.toUpperCase() + segment.slice(1))
          .join(' ');
        const primaryEmail = username + emailSuffix[index % emailSuffix.length]!;
        const primaryPhone = '1310805' + index.toString().padStart(4, '0');

        return createUserByAdmin({ username: prefix + username, primaryEmail, primaryPhone, name });
      })
    );
  });

  afterAll(async () => {
    await Promise.all(users.map(async ({ id }) => deleteUser(id)));
  });

  it('should return all users if nothing specified', async () => {
    const { headers } = await getUsers<User[]>([]);

    expect(Number(headers.get('total-number'))).toBeGreaterThanOrEqual(10);
  });

  describe('falling back to `like` mode and matches all available fields if only `search` is specified', () => {
    it('should search username', async () => {
      const { headers, json } = await getUsers<User[]>([['search', '%search_tom%']]);

      expect(headers.get('total-number')).toEqual('5');
      expect(json.length === 5 && json.every((user) => user.name === 'Tom Scott')).toBeTruthy();
    });

    it('should search primaryPhone', async () => {
      const { headers, json } = await getUsers<User[]>([['search', '%000%']]);

      expect(headers.get('total-number')).toEqual('10');
      expect(
        json.length === 10 && json.every((user) => user.username?.startsWith('search_'))
      ).toBeTruthy();
    });
  });

  it('should be able to perform case sensitive exact search', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.name', 'jerry swift'],
      ['mode.name', 'exact'],
      ['isCaseSensitive', 'true'],
    ]);

    expect(headers.get('total-number')).toEqual('0');
    expect(json.length === 0).toBeTruthy();
  });

  it('should be able to perform exact search', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.name', 'jerry swift'],
      ['mode.name', 'exact'],
    ]);

    expect(headers.get('total-number')).toEqual('2');
    expect(json.length === 2 && json.every((user) => user.name === 'Jerry Swift')).toBeTruthy();
  });

  it('should be able to perform hybrid search', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.name', '^Jerry((?!Jr).)*Jr{1}((?!Jr).)*$'], // Only one "Jr" after "Jerry"
      ['mode.name', 'posix'],
      ['search.username', 'search_%'], // Should fall back to `like` mode
      ['search.primaryPhone', '%0{3,}%'],
      ['mode.primaryPhone', 'similar_to'],
      ['joint', 'and'],
      ['isCaseSensitive', 'true'],
    ]);

    expect(headers.get('total-number')).toEqual('2');
    expect(json.length === 2 && json.every((user) => user.name === 'Jerry Swift Jr')).toBeTruthy();
  });

  it('should be able to perform hybrid search 2', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.name', '^T.?m Scot+$'],
      ['mode.name', 'posix'],
      ['search.username', 'search_tom%'],
      ['mode.username', 'similar_to'],
      ['isCaseSensitive', 'true'],
    ]);

    expect(headers.get('total-number')).toEqual('5');
    expect(
      json.length === 5 && json.every((user) => user.username?.startsWith('search_'))
    ).toBeTruthy();
  });

  it('should accept multiple value for exact match', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.primaryEmail', 'jerry_swiFt_jr@foo.bar'],
      ['search.primaryEmail', 'jerry_swift_Jr_2@geek.best'],
      ['search.primaryEmail', 'jerry_swift_jr_jR@gmail.com'],
      ['mode.primaryEmail', 'exact'],
    ]);

    expect(headers.get('total-number')).toEqual('3');
    expect(
      json.length === 3 && json.every((user) => user.name?.startsWith('Jerry Swift Jr'))
    ).toBeTruthy();
  });

  it('should accept multiple value for exact match 2', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.id', users[0]!.id],
      ['search.id', users[1]!.id],
      ['search.id', users[2]!.id],
      ['search.id', users[2]!.id],
      ['search.id', 'not_possible'],
      ['mode.id', 'exact'],
      ['isCaseSensitive', 'true'],
    ]);

    expect(headers.get('total-number')).toEqual('3');
    expect(
      json.length === 3 && json.every((user) => user.username?.startsWith('search_'))
    ).toBeTruthy();
  });

  it('should throw if multiple values found for non-exact mode', async () => {
    await expectRejects(
      getUsers<User[]>([
        ['search.primaryEmail', 'jerry_swift_jr@foo.bar'],
        ['search.primaryEmail', 'jerry_swift_jr_2@geek.best'],
        ['search.primaryEmail', 'jerry_swift_jr_jr@gmail.com'],
      ]),
      { code: 'request.invalid_input', status: 400, messageIncludes: '`exact`' }
    );
  });

  it('should throw if empty value found', async () => {
    await expectRejects(
      getUsers<User[]>([
        ['search.primaryEmail', ''],
        ['search', 'tom'],
      ]),
      {
        code: 'request.invalid_input',
        status: 400,
        messageIncludes: 'cannot be empty',
      }
    );
  });

  it('should throw if search is case-insensitive and uses `similar_to` mode', async () => {
    await expectRejects(
      getUsers<User[]>([
        ['search.primaryEmail', '%gmail%'],
        ['mode.primaryEmail', 'similar_to'],
      ]),
      {
        code: 'request.invalid_input',
        status: 400,
        messageIncludes: 'case-insensitive',
      }
    );
  });

  it('should throw if invalid const found', async () => {
    await Promise.all([
      expectRejects(
        getUsers<User[]>([
          ['search.primaryEmail', '%gmail%'],
          ['mode.primaryEmail', 'similar to'],
        ]),
        {
          code: 'request.invalid_input',
          status: 400,
          messageIncludes: 'is not valid',
        }
      ),
      expectRejects(getUsers<User[]>([['search.email', '%gmail%']]), {
        code: 'request.invalid_input',
        status: 400,
        messageIncludes: 'is not valid',
      }),
      expectRejects(
        getUsers<User[]>([
          ['search.primaryEmail', '%gmail%'],
          ['joint', 'and1'],
        ]),
        {
          code: 'request.invalid_input',
          status: 400,
          messageIncludes: 'is not valid',
        }
      ),
    ]);
  });
});

describe('admin console user search params - excludeRoleId', () => {
  const users: User[] = [];
  const roles: Role[] = [];
  const userPrefix = `search_exclude_role_`;
  const rolePrefix = `role_`;

  beforeAll(async () => {
    // Create users with different roles
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    users.push(
      ...(await Promise.all([
        createUser({ username: userPrefix + '1' }),
        createUser({ username: userPrefix + '2' }),
        createUser({ username: userPrefix + '3' }),
      ]))
    );
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    roles.push(
      ...(await Promise.all([
        createRole({ name: rolePrefix + '1' }),
        createRole({ name: rolePrefix + '2' }),
        createRole({ name: rolePrefix + '3' }),
      ]))
    );

    // Assign roles to users
    await Promise.all([
      assignRolesToUser(users[0]!.id, [roles[0]!.id, roles[1]!.id]),
      assignRolesToUser(users[1]!.id, [roles[1]!.id, roles[2]!.id]),
      assignRolesToUser(users[2]!.id, [roles[2]!.id]),
    ]);
  });

  afterAll(async () => {
    await Promise.all(users.map(async ({ id }) => deleteUser(id)));
    await Promise.all(roles.map(async ({ id }) => deleteRole(id)));
  });

  it('should be able to exclude users with a specific role (1)', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.username', userPrefix + '%'],
      ['excludeRoleId', roles[0]!.id],
    ]);

    expect(headers.get('total-number')).toEqual('2');
    expect(json).toHaveLength(2);
    expect(json).toContainEqual(expect.objectContaining({ id: users[1]!.id }));
    expect(json).toContainEqual(expect.objectContaining({ id: users[2]!.id }));
  });

  it('should be able to exclude users with a specific role (2)', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.username', userPrefix + '%'],
      ['excludeRoleId', roles[1]!.id],
    ]);

    expect(headers.get('total-number')).toEqual('1');
    expect(json).toHaveLength(1);
    expect(json).toContainEqual(expect.objectContaining({ id: users[2]!.id }));
  });
});

describe('admin console user search params - excludeOrganizationId', () => {
  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();
  const organizationPrefix = `search_exclude_organization_`;
  const userPrefix = `search_exclude_organization_`;

  beforeAll(async () => {
    await Promise.all([
      organizationApi.create({ name: organizationPrefix + '1' }),
      organizationApi.create({ name: organizationPrefix + '2' }),
      organizationApi.create({ name: organizationPrefix + '3' }),
    ]);

    await Promise.all([
      userApi.create({ username: userPrefix + '1' }),
      userApi.create({ username: userPrefix + '2' }),
      userApi.create({ username: userPrefix + '3' }),
    ]);

    const { organizations } = organizationApi;
    const { users } = userApi;

    await Promise.all([
      organizationApi.addUsers(organizations[0]!.id, [users[0]!.id, users[1]!.id]),
      organizationApi.addUsers(organizations[1]!.id, [users[1]!.id, users[2]!.id]),
      organizationApi.addUsers(organizations[2]!.id, [users[2]!.id]),
    ]);
  });

  afterAll(async () => {
    await organizationApi.cleanUp();
    await userApi.cleanUp();
  });

  it('should be able to exclude users with a specific organization (1)', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.username', userPrefix + '%'],
      ['excludeOrganizationId', organizationApi.organizations[0]!.id],
    ]);

    expect(headers.get('total-number')).toEqual('1');
    expect(json).toHaveLength(1);
    expect(json).toContainEqual(expect.objectContaining({ id: userApi.users[2]!.id }));
  });

  it('should be able to exclude users with a specific organization (2)', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.username', userPrefix + '%'],
      ['excludeOrganizationId', organizationApi.organizations[1]!.id],
    ]);

    expect(headers.get('total-number')).toEqual('1');
    expect(json).toHaveLength(1);
    expect(json).toContainEqual(expect.objectContaining({ id: userApi.users[0]!.id }));
  });

  it('should be able to exclude users with a specific organization (3)', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['search.username', userPrefix + '%'],
      ['excludeOrganizationId', organizationApi.organizations[2]!.id],
    ]);

    expect(headers.get('total-number')).toEqual('2');
    expect(json).toHaveLength(2);
    expect(json).toContainEqual(expect.objectContaining({ id: userApi.users[0]!.id }));
    expect(json).toContainEqual(expect.objectContaining({ id: userApi.users[1]!.id }));
  });
});
