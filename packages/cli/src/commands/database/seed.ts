import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { seeds } from '@logto/schemas';
import {
  createPool,
  DatabasePool,
  DatabaseTransactionConnection,
  parseDsn,
  sql,
  stringifyDsn,
} from 'slonik';
import { raw } from 'slonik-sql-tag-raw';
import { CommandModule } from 'yargs';
import { z } from 'zod';

import { createPoolFromConfig, getDatabaseUrlFromConfig, insertInto } from '../../database';
import { buildApplicationSecret, log } from '../../utilities';

/**
 * Create a database pool with the database URL in config.
 * If the given database does not exists, it will try to create a new database by connecting to the maintenance database `postgres`.
 *
 * @returns A new database pool with the database URL in config.
 */
const createDatabasePool = async () => {
  try {
    return await createPoolFromConfig();
  } catch (error: unknown) {
    const result = z.object({ code: z.string() }).safeParse(error);

    // Database does not exist, try to create one
    // https://www.postgresql.org/docs/14/errcodes-appendix.html
    if (!(result.success && result.data.code === '3D000')) {
      log.error(error);
    }

    const databaseUrl = await getDatabaseUrlFromConfig();
    const dsn = parseDsn(databaseUrl);
    // It's ok to fall back to '?' since:
    // - Database name is required to connect in the previous pool
    // - It will throw error when creating database using '?'
    const databaseName = dsn.databaseName ?? '?';
    const maintenancePool = await createPool(stringifyDsn({ ...dsn, databaseName: 'postgres' }));
    await maintenancePool.query(sql`
      create database ${sql.identifier([databaseName])}
        with
        encoding = 'UTF8'
        connection_limit = -1;
    `);
    await maintenancePool.end();

    log.info(`Database ${databaseName} successfully created.`);

    return createPoolFromConfig();
  }
};

const createTables = async (connection: DatabaseTransactionConnection) => {
  // https://stackoverflow.com/a/49455609/12514940
  const tableDirectory = path.join(
    // Until we migrate to ESM
    // eslint-disable-next-line unicorn/prefer-module
    path.dirname(require.resolve('@logto/schemas/package.json')),
    'tables'
  );
  const directoryFiles = await readdir(tableDirectory);
  const tableFiles = directoryFiles.filter((file) => file.endsWith('.sql'));
  const queries = await Promise.all(
    tableFiles.map<Promise<[string, string]>>(async (file) => [
      file,
      await readFile(path.join(tableDirectory, file), 'utf8'),
    ])
  );

  // Await in loop is intended for better error handling
  for (const [file, query] of queries) {
    // eslint-disable-next-line no-await-in-loop
    await connection.query(sql`${raw(query)}`);
    log.info(`Run ${file} succeeded.`);
  }
};

const seedTables = async (connection: DatabaseTransactionConnection) => {
  const {
    managementResource,
    defaultSignInExperience,
    createDefaultSetting,
    createDemoAppApplication,
    defaultRole,
  } = seeds;

  await Promise.all([
    connection.query(insertInto(managementResource, 'resources')),
    connection.query(insertInto(createDefaultSetting(), 'settings')),
    connection.query(insertInto(defaultSignInExperience, 'sign_in_experiences')),
    connection.query(
      insertInto(createDemoAppApplication(buildApplicationSecret()), 'applications')
    ),
    connection.query(insertInto(defaultRole, 'roles')),
  ]);
  log.info('Seed tables succeeded.');
};

export const seedByPool = async (pool: DatabasePool) => {
  await pool.transaction(async (connection) => {
    await createTables(connection);
    await seedTables(connection);
  });
};

const seed: CommandModule = {
  command: 'seed',
  describe: 'Create database and seed tables and data',
  handler: async () => {
    const pool = await createDatabasePool();

    try {
      await seedByPool(pool);
    } catch (error: unknown) {
      console.error(error);
      console.log();
      log.warn(
        'Error ocurred during seeding your database.\n\n' +
          '  Nothing has changed since the seeding process was in a transaction.\n' +
          '  Try to fix the error and seed again.'
      );
    }
    await pool.end();
  },
};

export default seed;
