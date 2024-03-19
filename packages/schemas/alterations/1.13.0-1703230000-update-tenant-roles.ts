import { ConsoleLog } from '@logto/shared';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const consoleLog = new ConsoleLog();

/**
 * This script update the following in the admin tenant:
 *
 * - Remove `owner` organization role.
 * - Add `manage:tenant` scope to `admin` organization role.
 * - Add `delete:data` scope to `member` organization role.
 * - Update descriptions accordingly.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    // Update existing owner to admin.
    await pool.query(sql`
      update organization_role_user_relations
      set organization_role_id = 'admin'
      where tenant_id = 'admin'
      and organization_role_id = 'owner';
    `);
    await pool.query(sql`
      delete from organization_roles
      where tenant_id = 'admin'
      and name = 'owner';
    `);
    await pool.query(sql`
      insert into organization_role_scope_relations (tenant_id, organization_role_id, organization_scope_id)
      values
        ('admin', 'admin', 'manage-tenant'),
        ('admin', 'member', 'delete-data');
    `);
    await pool.query(sql`
      update organization_roles
      set description = 'Admin of the tenant, who has all permissions.'
      where tenant_id = 'admin'
      and name = 'admin';
    `);
    await pool.query(sql`
      update organization_roles
      set description = 'Member of the tenant, who has permissions to operate the tenant data, but not the tenant settings.'
      where tenant_id = 'admin'
      and name = 'member';
    `);
  },
  down: async (pool) => {
    // Add back owner role
    await pool.query(sql`
      insert into organization_roles (tenant_id, id, name, description)
      values
        ('admin', 'owner', 'owner', 'Owner of the tenant, who has all permissions.');
    `);
    // Insert scope relations
    await pool.query(sql`
      insert into organization_role_scope_relations (tenant_id, organization_role_id, organization_scope_id)
      values
        ('admin', 'owner', 'read-data'),
        ('admin', 'owner', 'write-data'),
        ('admin', 'owner', 'delete-data'),
        ('admin', 'owner', 'invite-member'),
        ('admin', 'owner', 'remove-member'),
        ('admin', 'owner', 'update-member-role'),
        ('admin', 'owner', 'manage-tenant');
    `);
    // Remove added scopes
    await pool.query(sql`
      delete from organization_role_scope_relations
      where tenant_id = 'admin'
      and (organization_role_id = 'admin' and organization_scope_id = 'manage-tenant')
      or (organization_role_id = 'member' and organization_scope_id = 'delete-data');
    `);
    // Update descriptions
    await pool.query(sql`
      update organization_roles
      set description = 'Admin of the tenant, who has all permissions except managing the tenant settings.'
      where tenant_id = 'admin'
      and name = 'admin';
    `);
    await pool.query(sql`
      update organization_roles
      set description = 'Member of the tenant, who has limited permissions on reading and writing the tenant data.'
      where tenant_id = 'admin'
      and name = 'member';
    `);
    consoleLog.warn(
      'Original owners are not restored since the owner role has more permissions than admin, and we cannot tell which users are the original owners.'
    );
  },
};

export default alteration;
