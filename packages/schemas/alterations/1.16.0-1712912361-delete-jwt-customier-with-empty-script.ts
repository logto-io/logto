import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  // We are making the jwt-customizer script field mandatory
  // Delete the records in logto_configs where key is jwt.accessToken or jwt.clientCredentials and value jsonb's script field is undefined
  up: async (pool) => {
    await pool.query(
      sql`
        delete from logto_configs 
        where key in ('jwt.accessToken', 'jwt.clientCredentials')
        and value->>'script' is null
      `
    );
  },
  down: async () => {
    // No down script available, this is a non-reversible operation
    // It is fine since we have not released this feature yet
  },
};

export default alteration;
