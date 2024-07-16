/**
 * In Logto Cloud, we have multiple schemas and the default search behavior will be problematic.
 * This alteration script will fix it by setting the search path to public for the functions.
 */

import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter function check_application_type set search_path = public;
      alter function check_organization_role_type set search_path = public;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter function check_application_type reset search_path;
      alter function check_organization_role_type reset search_path;
    `);
  },
};

export default alteration;
