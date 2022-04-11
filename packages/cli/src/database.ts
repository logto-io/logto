import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { seeds } from '@logto/schemas';
import { createPool, sql } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';
import { raw } from 'slonik-sql-tag-raw';

import { insertInto } from './utilities';

const { managementResource, defaultSignInExperience, createDefaultSetting } = seeds;
const tableDirectory = 'node_modules/@logto/schemas/tables';
const domain = 'http://localhost:3001';

export const createDatabaseCli = (uri: string) => {
  const pool = createPool(uri, { interceptors: createInterceptors() });

  const createTables = async () => {
    const directory = await readdir(tableDirectory);
    const tableFiles = directory.filter((file) => file.endsWith('.sql'));
    const queries = await Promise.all(
      tableFiles.map<Promise<[string, string]>>(async (file) => [
        file,
        await readFile(path.join(tableDirectory, file), 'utf-8'),
      ])
    );

    // Await in loop is intended for better error handling
    for (const [file, query] of queries) {
      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`${raw(query)}`);
      console.log(`Create Tables: Run ${file} succeeded.`);
    }
  };

  const seedTables = async () => {
    await Promise.all([
      pool.query(insertInto(managementResource, 'resources')),
      pool.query(insertInto(createDefaultSetting(domain), 'settings')),
      pool.query(insertInto(defaultSignInExperience, 'sign_in_experiences')),
    ]);
    console.log('Seed Tables: Seed tables succeeded.');
  };

  return { createTables, seedTables };
};

// For testing purpose, will remove later
const cli = createDatabaseCli(process.env.DSN ?? '');
void cli.seedTables();
