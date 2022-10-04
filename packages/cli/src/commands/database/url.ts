import { CommandModule } from 'yargs';

import { getConfig } from '../../utilities';

export const getUrl: CommandModule = {
  command: 'get-url',
  describe: 'Get database URL in Logto config file',
  handler: async () => {
    const { databaseUrl } = await getConfig();
    console.log(databaseUrl);
  },
};
