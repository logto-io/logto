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
} from '@logto/schemas';
import { Tenants } from '@logto/schemas/models';
import { convertToIdentifiers, generateStandardId } from '@logto/shared';
import type { DatabaseTransactionConnection } from 'slonik';
import { sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

import { insertInto } from '../../../database.js';
import { getDatabaseName } from '../../../queries/database.js';
import { updateDatabaseTimestamp } from '../../../queries/system.js';
import { consoleLog, getPathInModule } from '../../../utils.js';

import { appendAdminConsoleRedirectUris, seedTenantCloudServiceApplication } from './cloud.js';
import { seedOidcConfigs } from './oidc-config.js';
import { seedTenantOrganizations } from './tenant-organizations.js';
import { assignScopesToRole, createTenant, seedAdminData } from './tenant.js';

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

export const createTables = async (connection: DatabaseTransactionConnection) => {
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
    parameters: { name?: string; database?: string } = {}
  ) => {
    const query = queries.find(([file]) => file.slice(1, -4) === lifecycle)?.[1];

    if (query) {
      await connection.query(
        sql`${raw(
          /* eslint-disable no-template-curly-in-string */
          query
            .replaceAll('${name}', parameters.name ?? '')
            .replaceAll('${database}', parameters.database ?? '')
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

  await runLifecycleQuery('before_all', { database });

  /* eslint-disable no-await-in-loop */
  for (const [file, query] of sorted) {
    await connection.query(sql`${raw(query)}`);

    if (!query.includes('/* no_after_each */')) {
      await runLifecycleQuery('after_each', { name: file.split('.')[0], database });
    }
  }
  /* eslint-enable no-await-in-loop */

  await runLifecycleQuery('after_all', { database });
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
      .filter(({ name }) => name === CloudScope.SendSms || name === CloudScope.SendEmail)
      .map(({ id }) => id)
  );

  // Assign all cloud API scopes to role `admin:admin`
  await assignScopesToRole(
    connection,
    adminTenantId,
    adminAdminData.role.id,
    ...cloudAdditionalScopes.map(({ id }) => id)
  );

  // FIXME: @wangsijie should not create tenant Cloud Service application in the OSS DB.
  await seedTenantCloudServiceApplication(connection, defaultTenantId);

  await Promise.all([
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
    updateDatabaseTimestamp(connection, latestTimestamp),
  ]);

  await seedTenantOrganizations(connection, isCloud);

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
export const seedTest = async (connection: DatabaseTransactionConnection) => {
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

  await Promise.all([
    connection.query(
      insertInto({ id: 'test-1', username: 'test1', tenantId: adminTenantId }, 'users')
    ),
    connection.query(
      insertInto({ id: 'test-2', username: 'test2', tenantId: adminTenantId }, 'users')
    ),
  ]);

  consoleLog.succeed('Created test users');

  const adminTenantRole = await getManagementRole(adminTenantId);
  const defaultTenantRole = await getManagementRole(defaultTenantId);

  await Promise.all([
    assignRoleToUser('test-1', adminTenantRole.id),
    assignRoleToUser('test-1', defaultTenantRole.id),
    assignRoleToUser('test-2', defaultTenantRole.id),
  ]);

  consoleLog.succeed('Assigned tenant management roles to the test users');
};
