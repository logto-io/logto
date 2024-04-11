import { generateKeyPair } from 'node:crypto';
import { promisify } from 'node:util';

import { generateStandardId } from '@logto/shared/universal';
import inquirer from 'inquirer';
import type { CommonQueryMethods, SerializableValue } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// Copied from CLI with default execution path
const generateOidcPrivateKey = async () => {
  const { privateKey } = await promisify(generateKeyPair)('ec', {
    // https://security.stackexchange.com/questions/78621/which-elliptic-curve-should-i-use
    namedCurve: 'secp384r1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return privateKey;
};

const generateOidcCookieKey = () => generateStandardId();

// Edited from CLI
const updateConfigByKey = async <T>(
  pool: CommonQueryMethods,
  tenantId: string,
  key: string,
  value: SerializableValue
) =>
  pool.query(
    sql`
      insert into logto_configs (tenant_id, key, value) 
        values (${tenantId}, ${key}, ${sql.jsonb(value)})
    `
  );

const adminTenantId = 'admin';
const defaultTenantId = 'default';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Init admin OIDC configs
    await updateConfigByKey(pool, adminTenantId, 'oidc.privateKeys', [
      await generateOidcPrivateKey(),
    ]);
    await updateConfigByKey(pool, adminTenantId, 'oidc.cookieKeys', [generateOidcCookieKey()]);

    // Skipped tables:
    //   applications_roles, applications, connectors, custom_phrases, logto_configs,
    //   passcodes, resources, roles_scopes, roles, scopes, sign_in_experiences,
    //   systems, users_roles, hooks, tenants
    //
    // Migrate: logs, oidc_model_instances, users

    // Find admin users
    const { rows } = await pool.query<{ userId: string; count: number }>(sql`
      select
        users.id as "userId",
        (select count(*) from users_roles where users.id = user_id) 
      from users
        inner join users_roles on users.id = users_roles.user_id
        inner join roles on roles.id = users_roles.role_id
        where roles.name = 'admin';
    `);

    const invalidUsers = rows.filter(({ count }) => count > 1);

    if (invalidUsers.length > 0) {
      throw new Error(
        'Some of your current admin users have extra roles. Either remove their `admin` role to become a normal user, or remove all other roles to migrate them to the new Admin Tenant.\n\n' +
          'Invalid user IDs: ' +
          invalidUsers.map(({ userId }) => userId).join(', ')
      );
    }

    const userIds = rows.map(({ userId }) => userId);

    if (userIds.length === 0) {
      console.log('No admin user found, skip alteration');

      return;
    }

    const inUserIds = sql`in (${sql.join(userIds, sql`, `)})`;

    // Remove the admin role from users_roles
    await pool.query(sql`
      delete from users_roles
      where user_id ${inUserIds};
    `);

    // Update data
    console.warn(
      'Some of the logs will stay in the default tenant since the related interaction has been removed.'
    );

    await pool.query(sql`
      update users
        set tenant_id = ${adminTenantId}
        where id ${inUserIds};
    `);
    await pool.query(sql`
      update logs
        set tenant_id = ${adminTenantId}
        where payload->>'userId' ${inUserIds};
    `);
    await pool.query(sql`
      update oidc_model_instances
      set tenant_id = ${adminTenantId}
        where payload->>'accountId' ${inUserIds};
    `);

    // Assign roles
    const { rows: roles } = await pool.query<{ id: string }>(sql`
      select id from roles
        where tenant_id = ${adminTenantId}
        and (name = ${'default:admin'} or name = ${'user'})
    `);

    if (roles.length !== 2) {
      throw new Error('Admin tenant should have both `default:admin` and `user` role.');
    }

    await pool.query(sql`
      insert into users_roles (tenant_id, id, user_id, role_id)
        values ${sql.join(
          userIds.flatMap((userId) =>
            roles.map(
              ({ id }) => sql`(${adminTenantId}, ${generateStandardId()}, ${userId}, ${id})`
            )
          ),
          sql`,`
        )};
    `);
  },
  down: async (pool) => {
    const { rows } = await pool.query<{ id: string }>(sql`select id from tenants;`);
    const tenantIds = rows
      .map(({ id }) => id)
      .slice()
      .sort((i, j) => i.localeCompare(j));

    if (!(tenantIds.length === 2 && tenantIds[0] === 'admin' && tenantIds[1] === 'default')) {
      throw new Error('The tenants table should only have exact `admin` and `default` tenant.');
    }

    const isCi = process.env.CI;
    const { confirm } = await inquirer.prompt<{ confirm: boolean }>({
      type: 'confirm',
      name: 'confirm',
      message: String(
        '***CAUTION***\n' +
          'The `down()` function will restore Admin Tenant users to the default tenant.\n' +
          'Except `users`, and `logs`, ALL other data will be dropped.\n' +
          'Are you sure to continue?'
      ),
      default: false,
      when: !isCi,
    });

    if (!isCi && !confirm) {
      throw new Error('User cancelled alteration.');
    }

    const { rows: adminUsers } = await pool.query<{ id: string }>(sql`
      select users.id from users
        inner join users_roles on users.id = users_roles.user_id
        inner join roles on roles.id = users_roles.role_id
        where roles.name = 'default:admin'
        and users.tenant_id = 'admin';
    `);
    const adminUserIds = adminUsers.map(({ id }) => id);

    if (adminUserIds.length > 0) {
      await pool.query(sql`
        insert into users_roles (tenant_id, id, user_id, role_id)
          values ${sql.join(
            adminUserIds.map(
              (id) => sql`(${defaultTenantId}, ${generateStandardId()}, ${id}, ${'admin-role'})`
            ),
            sql`,`
          )};
      `);

      console.log(`Converted admin role for user ID(s): ${adminUserIds.join(', ')}`);
    }

    await pool.query(sql`
      update users set tenant_id = ${defaultTenantId};
    `);
    await pool.query(sql`
      update logs set tenant_id = ${defaultTenantId};
    `);
    await pool.query(sql`
      delete from tenants where id = ${adminTenantId};
    `);
  },
};

export default alteration;
