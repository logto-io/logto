import { generateStandardId } from '@logto/shared/universal';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    const isCi = process.env.CI;
    const { confirm } = await inquirer.prompt<{ confirm: boolean }>({
      type: 'confirm',
      name: 'confirm',
      message: String(
        chalk.bold(chalk.yellow('***CAUTION***')) +
          '\n' +
          'The application `demo-app` will be removed from your database.\n' +
          'Usually this is harmless since the demo app will be still functional with predefined data.\n' +
          'Are you sure to continue?'
      ),
      default: false,
      when: !isCi,
    });

    if (!isCi && !confirm) {
      throw new Error('User cancelled alteration.');
    }

    await pool.query(sql`
      delete from applications where id = 'demo-app';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      insert into applications
        (tenant_id, id, secret, name, description, type, oidc_client_metadata)
        values (
          'default',
          'demo-app',
          ${generateStandardId()},
          'Demo App',
          'Logto demo app.',
          'SPA',
          '{ "redirectUris": [], "postLogoutRedirectUris": [] }'::jsonb
        );
    `);
  },
};

export default alteration;
