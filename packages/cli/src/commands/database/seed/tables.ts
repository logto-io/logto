import { readdir, readFile } from 'fs/promises';
import path from 'path';

import {
  defaultSignInExperience,
  createDefaultAdminConsoleConfig,
  defaultTenantId,
  adminTenantId,
  defaultManagementApi,
  createAdminDataInAdminTenant,
  createMeApiInAdminTenant,
} from '@logto/schemas';
import { Hooks, Tenants } from '@logto/schemas/models';
import type { DatabaseTransactionConnection } from 'slonik';
import { sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

import { insertInto } from '../../../database.js';
import { getDatabaseName } from '../../../queries/database.js';
import { updateDatabaseTimestamp } from '../../../queries/system.js';
import { getPathInModule } from '../../../utils.js';
import { seedOidcConfigs } from './oidc-config.js';
import { createTenant, seedAdminData } from './tenant.js';

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
    [Hooks.tableName, Hooks.raw],
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
  latestTimestamp: number
) => {
  await createTenant(connection, defaultTenantId);
  await seedOidcConfigs(connection, defaultTenantId);
  await seedAdminData(connection, defaultManagementApi);

  await createTenant(connection, adminTenantId);
  await seedOidcConfigs(connection, adminTenantId);
  await seedAdminData(connection, createAdminDataInAdminTenant(defaultTenantId));
  await seedAdminData(connection, createMeApiInAdminTenant());

  await Promise.all([
    connection.query(insertInto(createDefaultAdminConsoleConfig(defaultTenantId), 'logto_configs')),
    connection.query(insertInto(defaultSignInExperience, 'sign_in_experiences')),
    updateDatabaseTimestamp(connection, latestTimestamp),
  ]);
};
