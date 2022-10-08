import { CommandModule } from 'yargs';

import { getConfig, patchConfig } from '../../config';

export const getUrl: CommandModule = {
  command: 'get-url',
  describe: 'Get database URL in Logto config file',
  handler: async () => {
    const { databaseUrl } = await getConfig();
    console.log(databaseUrl);
  },
};

export const setUrl: CommandModule<unknown, { url: string }> = {
  command: 'set-url <url>',
  describe: 'Set database URL and save to config file',
  builder: (yargs) =>
    yargs.positional('url', {
      describe: 'The database URL (DSN) to use, including database name',
      type: 'string',
      demandOption: true,
    }),
  handler: async (argv) => {
    await patchConfig({ databaseUrl: String(argv.url) });
  },
};
