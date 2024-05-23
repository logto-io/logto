import { ConsoleLog, generateStandardId } from '@logto/shared';
import { yes } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const isCi = yes(process.env.CI);

const defaultTenantId = 'default';
const defaultTenantManagementApiIndicator = `https://${defaultTenantId}.logto.app/api`;
const roleName = 'Logto Management API access';
const roleDescription = 'This default role grants access to the Logto management API.';
enum RoleType {
  MachineToMachine = 'MachineToMachine',
}

enum PredefinedScope {
  All = 'all',
}

const consoleLog = new ConsoleLog();

/**
 * This script is to create a pre-configured Management API M2M role for new users.
 * This script is **only for CI**, since we won't create this role for existing users, so this script is not applicable for existing db data.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    if (!isCi) {
      consoleLog.info(
        "Skipping the alteration script `next-1716291265-create-pre-configured-m-api-role.ts` since it's should not be applied to existing db data."
      );
      return;
    }

    /**
     * Only affect the `default` tenant, since this is the only tenant in the OSS version and the initial tenant in the cloud version.
     * So we only need to care about this role for the `default` tenant.
     */

    const roleId = generateStandardId();

    await pool.query(sql`
      insert into roles (id, tenant_id, name, description, type)
      values (
        ${roleId},
        ${defaultTenantId},
        ${roleName},
        ${roleDescription},
        ${RoleType.MachineToMachine}
      );
    `);

    // Assign Logto Management API permission `all` to the Logto Management API M2M role
    await pool.query(sql`
      insert into roles_scopes (id, role_id, scope_id, tenant_id)
      values (
        ${generateStandardId()},
        ${roleId},
        (
          select scopes.id
          from scopes
          join resources on
            scopes.tenant_id = resources.tenant_id and
            scopes.resource_id = resources.id
          where resources.indicator = ${defaultTenantManagementApiIndicator}
          and scopes.name = ${PredefinedScope.All}
          and scopes.tenant_id = ${defaultTenantId}
        ),
        ${defaultTenantId}
      )
    `);
  },
  down: async (pool) => {
    if (!isCi) {
      consoleLog.info(
        "Skipping the down script `next-1716291265-create-pre-configured-m-api-role.ts` since it's should not be applied to production db."
      );
      return;
    }

    // Delete the created role
    await pool.query(sql`
      delete from roles
      where tenant_id = ${defaultTenantId}
      and name = ${roleName}
      and description = ${roleDescription}
      and type = ${RoleType.MachineToMachine}
    `);
  },
};

export default alteration;
