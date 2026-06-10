import { createMockCommonQueryMethods, expectSqlString } from '#src/test-utils/query.js';

import { UserRelationQueries } from './user-relations.js';

const { jest } = import.meta;

describe('UserRelationQueries', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getUsersByOrganizationId should filter users by organization role', async () => {
    const pool = createMockCommonQueryMethods();
    const users = [{ id: 'user-id', organizationRoles: [{ id: 'role-id', name: 'Role' }] }];
    pool.one.mockResolvedValueOnce({ count: '12' });
    pool.any.mockResolvedValueOnce(users);

    const queries = new UserRelationQueries(pool);
    const result = await queries.getUsersByOrganizationId(
      'organization-id',
      { limit: 3, offset: 0 },
      undefined,
      { organizationRoleId: 'organization-role-id' }
    );

    expect(result).toEqual([12, users]);
    expect(pool.one).toHaveBeenCalledWith(expectSqlString('organization_role_user_relations'));
    expect(pool.one).toHaveBeenCalledWith(expectSqlString('organization_role_id'));
    expect(pool.any).toHaveBeenCalledWith(expectSqlString('limit'));
  });
});
