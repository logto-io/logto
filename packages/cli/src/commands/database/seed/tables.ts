import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  createDefaultAdminConsoleConfig,
  defaultTenantId,
  adminTenantId,
  defaultManagementApi,
  createAdminDataInAdminTenant,
  createMeApiInAdminTenant,
  createDefaultSignInExperience,
  createAdminTenantSignInExperience,
  createDefaultAdminConsoleApplication,
  createCloudApi,
  createTenantApplicationRole,
  CloudScope,
  Roles,
  type Role,
  UsersRoles,
  LogtoConfigs,
  SignInExperiences,
  Applications,
  OrganizationUserRelations,
  getTenantOrganizationId,
  Users,
  OrganizationRoleUserRelations,
  TenantRole,
} from '@logto/schemas';
import { getTenantRole } from '@logto/schemas';
import { Tenants } from '@logto/schemas/models';
import { generateStandardId } from '@logto/shared';
import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { getDatabaseName } from '../../../queries/database.js';
import { updateDatabaseTimestamp } from '../../../queries/system.js';
import { convertToIdentifiers } from '../../../sql.js';
import { consoleLog, getPathInModule } from '../../../utils.js';

import { appendAdminConsoleRedirectUris, seedTenantCloudServiceApplication } from './cloud.js';
import { seedOidcConfigs } from './oidc-config.js';
import { seedTenantOrganizations } from './tenant-organizations.js';
import {
  assignScopesToRole,
  createTenant,
  seedAdminData,
  seedLegacyManagementApiUserRole,
  seedManagementApiProxyApplications,
} from './tenant.js';

const getExplicitOrder = (query: string) => {
  const matched = /\/\*\s*init_order\s*=\s*([\d.]+)\s*\*\//.exec(query)?.[1];

  return matched ? Number(matched) : undefined;
};

const compareQuery = ([t1, q1]: [string, string], [t2, q2]: [string, string]) => {
  const o1 = getExplicitOrder(q1);
  const o2 = getExplicitOrder(q2);

  if (o1 === undefined && o2 === undefined) {
    return t1.localeCompare(t2);
  }

  if (o1 === undefined) {
    return 1;
  }

  if (o2 === undefined) {
    return -1;
  }

  return o1 - o2;
};

type Lifecycle = 'before_all' | 'after_all' | 'after_each';

const lifecycleNames: readonly string[] = Object.freeze([
  'before_all',
  'after_all',
  'after_each',
] satisfies Lifecycle[]);

export const createTables = async (
  connection: DatabaseTransactionConnection,
  encryptBaseRole: boolean
): Promise<{ password: string }> => {
  const tableDirectory = getPathInModule('@logto/schemas', 'tables');
  const directoryFiles = await readdir(tableDirectory);
  const tableFiles = directoryFiles.filter((file) => file.endsWith('.sql'));
  const queries = await Promise.all(
    tableFiles.map<Promise<[string, string]>>(async (file) => [
      file,
      await readFile(path.join(tableDirectory, file), 'utf8'),
    ])
  );

  const runLifecycleQuery = async (
    lifecycle: Lifecycle,
    parameters: { name?: string; database?: string; password?: string } = {}
  ) => {
    const query = queries.find(([file]) => file.slice(1, -4) === lifecycle)?.[1];

    if (query) {
      await connection.query(
        sql`${sql.raw(
          /* eslint-disable no-template-curly-in-string */
          query
            .replaceAll('${name}', parameters.name ?? '')
            .replaceAll('${database}', parameters.database ?? '')
            .replaceAll('${password}', parameters.password ?? '')
          /* eslint-enable no-template-curly-in-string */
        )}`
      );
    }
  };

  const allQueries: Array<[string, string]> = [
    [Tenants.tableName, Tenants.raw],
    ...queries.filter(([file]) => !lifecycleNames.includes(file.slice(1, -4))),
  ];
  const sorted = allQueries.slice().sort(compareQuery);
  const database = await getDatabaseName(connection, true);
  const password = encryptBaseRole ? generateStandardId(32) : '';

  await runLifecycleQuery('before_all', { database, password });

  /* eslint-disable no-await-in-loop */
  for (const [file, query] of sorted) {
    await connection.query(sql`${sql.raw(query)}`);

    if (!query.includes('/* no_after_each */')) {
      await runLifecycleQuery('after_each', { name: file.split('.')[0], database });
    }
  }
  /* eslint-enable no-await-in-loop */

  await runLifecycleQuery('after_all', { database });

  return { password };
};

export const seedTables = async (
  connection: DatabaseTransactionConnection,
  latestTimestamp: number,
  isCloud: boolean
) => {
  await createTenant(connection, defaultTenantId);
  await seedOidcConfigs(connection, defaultTenantId);
  await seedAdminData(connection, defaultManagementApi);

  await createTenant(connection, adminTenantId);
  await seedOidcConfigs(connection, adminTenantId);
  await seedAdminData(connection, createAdminDataInAdminTenant(defaultTenantId));
  const adminAdminData = createAdminDataInAdminTenant(adminTenantId);
  await seedAdminData(connection, adminAdminData);
  await seedAdminData(connection, createMeApiInAdminTenant());

  const [cloudData, ...cloudAdditionalScopes] = createCloudApi();
  await seedAdminData(connection, cloudData, ...cloudAdditionalScopes);

  // Create tenant application role
  const applicationRole = createTenantApplicationRole();
  await connection.query(insertInto(applicationRole, Roles.table));
  await assignScopesToRole(
    connection,
    adminTenantId,
    applicationRole.id,
    ...cloudAdditionalScopes
      .filter(
        ({ name }) =>
          name === CloudScope.SendSms ||
          name === CloudScope.SendEmail ||
          name === CloudScope.FetchCustomJwt
      )
      .map(({ id }) => id)
  );

  await Promise.all([
    seedLegacyManagementApiUserRole(connection),
    seedTenantCloudServiceApplication(connection, defaultTenantId),
    connection.query(
      insertInto(createDefaultAdminConsoleConfig(defaultTenantId), LogtoConfigs.table)
    ),
    connection.query(
      insertInto(createDefaultAdminConsoleConfig(adminTenantId), LogtoConfigs.table)
    ),
    connection.query(
      insertInto(createDefaultSignInExperience(defaultTenantId, isCloud), SignInExperiences.table)
    ),
    connection.query(insertInto(createAdminTenantSignInExperience(), SignInExperiences.table)),
    connection.query(insertInto(createDefaultAdminConsoleApplication(), Applications.table)),
  ]);

  // The below seed data is for the Logto Cloud only. We put it here for the sack of simplicity.
  // The data is not harmful for OSS, since they are all admin tenant data. OSS will not use them
  // and they cannot be seen by the Console.
  await Promise.all([
    seedTenantOrganizations(connection),
    seedManagementApiProxyApplications(connection),
  ]);

  await updateDatabaseTimestamp(connection, latestTimestamp);

  consoleLog.succeed('Seed data');
};

export const seedCloud = async (connection: DatabaseTransactionConnection) => {
  await Promise.all([
    appendAdminConsoleRedirectUris(connection),
    seedTenantCloudServiceApplication(connection, adminTenantId),
  ]);
};

/**
 * Seed additional test data for integration or alteration tests.
 *
 * It will create two users to the admin tenant (`test-1` and `test-2`), and do the following:
 *
 * - `test-1` will be assigned the management roles for both `default` and `admin` tenant.
 * - `test-2`  will be assigned the management role for `default` tenant.
 */
export const seedTest = async (connection: DatabaseTransactionConnection, forLegacy = false) => {
  const roles = convertToIdentifiers(Roles);
  const getManagementRole = async (tenantId: string) =>
    connection.one<Role>(sql`
      select ${roles.fields.id}
      from ${roles.table}
      where ${roles.fields.tenantId} = ${adminTenantId}
      and ${roles.fields.name} = ${`${tenantId}:admin`}
    `);

  const assignRoleToUser = async (userId: string, roleId: string) =>
    connection.query(
      insertInto(
        { id: generateStandardId(), userId, roleId, tenantId: adminTenantId },
        UsersRoles.table
      )
    );

  const userIds = Object.freeze(['test-1', 'test-2'] as const);
  await Promise.all([
    connection.query(
      insertInto({ id: userIds[0], username: 'test1', tenantId: adminTenantId }, Users.table)
    ),
    connection.query(
      insertInto({ id: userIds[1], username: 'test2', tenantId: adminTenantId }, Users.table)
    ),
  ]);

  if (forLegacy) {
    const adminTenantRole = await getManagementRole(adminTenantId);
    await assignRoleToUser(userIds[0], adminTenantRole.id);
  }

  consoleLog.succeed('Created test users');

  // The only legacy user role for Management API. Used in OSS only.
  const defaultTenantRole = await getManagementRole(defaultTenantId);

  await Promise.all([
    assignRoleToUser(userIds[0], defaultTenantRole.id),
    assignRoleToUser(userIds[1], defaultTenantRole.id),
  ]);
  consoleLog.succeed('Assigned tenant management roles to the test users');

  // This check is for older versions (<=v.12.0) that don't have tenant organization initialized.
  if (forLegacy) {
    consoleLog.warn(
      'Tenant organization is not enabled in legacy Logto versions, skip seeding tenant organization data'
    );
    return;
  }

  const addOrganizationMembership = async (userId: string, tenantId: string) =>
    connection.query(
      insertInto(
        { userId, organizationId: getTenantOrganizationId(tenantId), tenantId: adminTenantId },
        OrganizationUserRelations.table
      )
    );

  await Promise.all([
    addOrganizationMembership(userIds[0], adminTenantId),
    addOrganizationMembership(userIds[0], defaultTenantId),
    addOrganizationMembership(userIds[1], defaultTenantId),
  ]);

  const assignOrganizationRole = async (userId: string, tenantId: string, tenantRole: TenantRole) =>
    connection.query(
      insertInto(
        {
          userId,
          organizationRoleId: getTenantRole(tenantRole).id,
          organizationId: getTenantOrganizationId(tenantId),
          tenantId: adminTenantId,
        },
        OrganizationRoleUserRelations.table
      )
    );

  await Promise.all([
    assignOrganizationRole(userIds[0], adminTenantId, TenantRole.Admin),
    assignOrganizationRole(userIds[0], defaultTenantId, TenantRole.Admin),
    assignOrganizationRole(userIds[1], defaultTenantId, TenantRole.Admin),
  ]);
  consoleLog.succeed('Assigned tenant organization membership and roles to the test users');
};
