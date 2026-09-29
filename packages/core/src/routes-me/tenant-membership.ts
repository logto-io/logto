import { Organizations, defaultManagementApiAdminName } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import {
  sql,
  type CommonQueryMethods,
  type DatabaseTransactionConnection,
} from '@silverhand/slonik';

import OrganizationQueries from '#src/queries/organization/index.js';
import { createRolesQueries } from '#src/queries/roles.js';
import { createUserQueries } from '#src/queries/user.js';
import { createUsersRolesQueries } from '#src/queries/users-roles.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { createTenantMemberAuthorization, tenantOrganizationId } from './tenant-organization.js';

/**
 * Console access of the tenant members.
 *
 * OSS Console calls the Management API of the default tenant with a user token, and that API is
 * granted by the legacy `default:admin` user role rather than by the tenant organization. Members
 * who join or leave the organization gain or lose that role with it, or they would be members who
 * cannot open Console, or former members who still can.
 */
const createConsoleAccessLibrary = (pool: CommonQueryMethods) => {
  const roles = createRolesQueries(pool);
  const usersRoles = createUsersRolesQueries(pool);

  const findConsoleRole = async () => {
    const role = await roles.findRoleByRoleName(defaultManagementApiAdminName);

    assertThat(role, new Error(`The \`${defaultManagementApiAdminName}\` role is missing.`));

    return role;
  };

  const grant = async (userId: string) => {
    const { id: roleId } = await findConsoleRole();

    if (!(await usersRoles.hasUserRole(userId, [roleId]))) {
      await usersRoles.insertUsersRoles([{ id: generateStandardId(), userId, roleId }]);
    }
  };

  const revoke = async (userId: string) => {
    const { id: roleId } = await findConsoleRole();

    if (await usersRoles.hasUserRole(userId, [roleId])) {
      await usersRoles.deleteUsersRolesByUserIdAndRoleId(userId, roleId);
    }
  };

  return { grant, revoke };
};

/** Everything a membership change reads and writes, bound to its transaction. */
const createTenantMembershipTransaction = (connection: DatabaseTransactionConnection) => {
  const organizations = new OrganizationQueries(connection);

  return {
    connection,
    organizations,
    users: createUserQueries(connection),
    consoleAccess: createConsoleAccessLibrary(connection),
    ...createTenantMemberAuthorization({ queries: { organizations } }),
  };
};

type TenantMembershipTransaction = ReturnType<typeof createTenantMembershipTransaction>;

/**
 * Change the membership of the tenant: its members, their roles, their Console access and its
 * invitations.
 *
 * Changes run one at a time, each in a transaction that locks the tenant organization first, and
 * check the caller and the members only once they hold the lock. Without it, two admins removing
 * each other both pass the last-admin check, and a removal racing an acceptance leaves a non-member
 * with Console access. All writes of a change commit together, so membership and Console access
 * never part on a failure halfway.
 */
export const withTenantMembership = async <T>(
  { queries: { pool } }: Pick<TenantContext, 'queries'>,
  run: (transaction: TenantMembershipTransaction) => Promise<T>
): Promise<T> =>
  pool.transaction(async (connection) => {
    const { table, fields } = convertToIdentifiers(Organizations);
    await connection.query(sql`
      select 1
      from ${table}
      where ${fields.id} = ${tenantOrganizationId}
      for update
    `);

    return run(createTenantMembershipTransaction(connection));
  });
