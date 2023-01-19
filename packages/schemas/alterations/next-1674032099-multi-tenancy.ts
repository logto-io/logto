import { conditionalString } from '@silverhand/essentials';
import { sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

import type { AlterationScript } from '../lib/types/alteration.js';

const getId = (value: string) => sql.identifier([value]);
const tenantId = sql.identifier(['tenant_id']);
const defaultTenantId = 'default';

// [table name, primary key array]
type TableInfo = [string, string[]];

const tables: TableInfo[] = [
  ['applications', ['id']],
  ['connectors', ['id']],
  ['custom_phrases', ['language_tag']],
  ['logs', ['id']],
  ['oidc_model_instances', ['model_name', 'id']],
  ['passcodes', ['id']],
  ['resources', ['id']],
  ['roles', ['id']],
  ['roles_scopes', ['role_id', 'scope_id']],
  ['scopes', ['id']],
  ['settings', ['id']],
  ['sign_in_experiences', ['id']],
  ['users_roles', ['user_id', 'role_id']],
  ['users', ['id']],
];

type IndexInfo = {
  table: string;
  indexes: Array<{ name?: string; type?: 'unique'; columns: string[]; strategy?: 'drop-only' }>;
};

const indexes: IndexInfo[] = [
  {
    table: 'logs',
    indexes: [
      { columns: ['key'] },
      { columns: ['created_at'], strategy: 'drop-only' },
      { name: 'user_id', columns: ["(payload->>'user_id') nulls last"] },
      { name: 'application_id', columns: ["(payload->>'application_id') nulls last"] },
    ],
  },
  {
    table: 'oidc_model_instances',
    indexes: [
      { name: 'model_name_payload_user_code', columns: ['model_name', "(payload->>'userCode')"] },
      { name: 'model_name_payload_uid', columns: ['model_name', "(payload->>'uid')"] },
      { name: 'model_name_payload_grant_id', columns: ['model_name', "(payload->>'grantId')"] },
    ],
  },
  {
    table: 'passcodes',
    indexes: [
      { columns: ['interaction_jti', 'type'] },
      { columns: ['email', 'type'] },
      { columns: ['phone', 'type'] },
    ],
  },
  { table: 'resources', indexes: [{ type: 'unique', columns: ['indicator'] }] },
  { table: 'roles', indexes: [{ type: 'unique', columns: ['name'] }] },
  { table: 'scopes', indexes: [{ type: 'unique', columns: ['resource_id', 'name'] }] },
  {
    table: 'users',
    indexes: [{ columns: ['name'] }, { columns: ['created_at'], strategy: 'drop-only' }],
  },
];

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table tenants (
        id varchar(21) not null,
        db_user_password varchar(128),
        primary key (id)
      );
    `);

    await pool.query(sql`
      insert into tenants (${getId('id')}, ${getId('db_user_password')})
      values (${defaultTenantId}, null);
    `);

    // Update primary keys
    await Promise.all(
      tables.map(async ([tableName, primaryKeys]) => {
        // Add `tenant_id` column and set existing data to a default tenant
        await pool.query(sql`
          alter table ${sql.identifier([tableName])}
            add column ${tenantId} varchar(21) not null default 'default'
              references tenants (id) on update cascade on delete cascade,
            drop constraint ${sql.identifier([tableName + '_pkey'])} cascade,
            add primary key (${sql.join(
              ['tenant_id', ...primaryKeys].map((key) => sql.identifier([key])),
              sql`, `
            )});
        `);

        // Column should not have a default tenant ID, it should be always manually assigned
        await pool.query(sql`
          alter table ${sql.identifier([tableName])}
          alter column ${tenantId} drop default;
        `);
      })
    );

    // Update indexes
    await Promise.all(
      indexes.flatMap(({ table, indexes }) =>
        indexes.map(async ({ name, type, columns, strategy }) => {
          const indexName = getId(`${table}__${name ?? columns.join('_')}`);
          await pool.query(sql`drop index ${indexName}`);

          if (strategy !== 'drop-only') {
            await pool.query(
              sql`
                create ${raw(conditionalString(type))} index ${indexName} 
                  on ${getId(table)}
                  (
                    ${tenantId},
                    ${sql.join(
                      columns.map((column) => raw(column)),
                      sql`, `
                    )}
                  );
              `
            );
          }
        })
      )
    );
  },
  down: async (pool) => {
    throw new Error('Not implemented');
  },
};

export default alteration;
