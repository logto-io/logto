import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { createPool, sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

const tableDirectory = 'node_modules/@logto/schemas/tables';

export const createDatabaseCli = (uri: string) => {
  const pool = createPool(uri);

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
      console.log(`Run ${file} succeeded.`);
    }
  };

  return { createTables };
};

// For testing purpose, will remove later
const cli = createDatabaseCli(process.env.DSN ?? '');
void cli.createTables();
