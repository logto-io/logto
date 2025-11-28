import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Add UUID support - Part 2: Primary entity tables
 *
 * This migration expands ID columns in primary entity tables to support UUID v7 (36 characters):
 * - users.id (12 -> 36)
 * - organizations.id (21 -> 36)
 * - roles.id (21 -> 36)
 * - organization_roles.id (21 -> 36)
 * - applications.id (21 -> 36)
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    // Alter users table to support UUID (12 -> 36 characters)
    await pool.query(sql`
      alter table users
        alter column id type varchar(36);
    `);

    // Alter organizations table to support UUID (21 -> 36 characters)
    await pool.query(sql`
      alter table organizations
        alter column id type varchar(36);
    `);

    // Alter roles table to support UUID (21 -> 36 characters)
    await pool.query(sql`
      alter table roles
        alter column id type varchar(36);
    `);

    // Alter organization_roles table to support UUID (21 -> 36 characters)
    await pool.query(sql`
      alter table organization_roles
        alter column id type varchar(36);
    `);

    // Alter applications table to support UUID (21 -> 36 characters)
    await pool.query(sql`
      alter table applications
        alter column id type varchar(36);
    `);
  },
  down: async (pool) => {
    // Revert applications table
    await pool.query(sql`
      alter table applications
        alter column id type varchar(21);
    `);

    // Revert organization_roles table
    await pool.query(sql`
      alter table organization_roles
        alter column id type varchar(21);
    `);

    // Revert roles table
    await pool.query(sql`
      alter table roles
        alter column id type varchar(21);
    `);

    // Revert organizations table
    await pool.query(sql`
      alter table organizations
        alter column id type varchar(21);
    `);

    // Revert users table
    await pool.query(sql`
      alter table users
        alter column id type varchar(12);
    `);
  },
};

export default alteration;
