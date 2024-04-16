import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

import { setTenantSeederData, type OgcioTenantSeeder } from './ogcio-seeder.js';
import { seedOgcio } from './ogcio.js';

const DEFAULT_SEEDER_FILE = './src/commands/database/ogcio/ogcio-seeder.json';

const loadSeederData = (path: string): OgcioTenantSeeder =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

const getSeederData = async (seederFilepath: unknown): Promise<OgcioTenantSeeder> => {
  if (typeof seederFilepath !== 'string' || seederFilepath.length === 0) {
    throw new Error('seeder-filepath must be set!');
  }

  const filePath = resolve(process.cwd(), seederFilepath);

  return loadSeederData(filePath);
};

const ogcio: CommandModule<Partial<{ seederFilepath: unknown }>> = {
  command: 'ogcio',
  describe: 'Seed OGCIO data',
  builder: (yargs) =>
    yargs.option('seeder-filepath', {
      describe:
        'The file where get data to seed, the path is relative to folder the command is ran from',
      type: 'string',
      default: DEFAULT_SEEDER_FILE,
    }),
  handler: async ({ seederFilepath }) => {
    const inputSeeder = await getSeederData(seederFilepath);
    setTenantSeederData(inputSeeder);
    const pool = await createPoolAndDatabaseIfNeeded();
    try {
      await seedOgcio(pool);
    } catch (error: unknown) {
      consoleLog.error(error);
      throw error;
    } finally {
      await pool.end();
    }
  },
};

export default ogcio;
