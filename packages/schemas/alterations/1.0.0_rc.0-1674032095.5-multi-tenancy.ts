import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const getId = (value: string) => sql.identifier([value]);
const tenantId = sql.identifier(['tenant_id']);

const tables: string[] = [
  'applications',
  'applications_roles',
  'connectors',
  'custom_phrases',
  'logs',
  'oidc_model_instances',
  'passcodes',
  'resources',
  'roles_scopes',
  'roles',
  'scopes',
  'settings',
  'sign_in_experiences',
  'users_roles',
  'users',
];

type IndexInfo = {
  table: string;
  indexes: Array<{ name?: string; columns: string[]; strategy?: 'drop-only' }>;
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
  {
    table: 'users',
    indexes: [{ columns: ['name'] }, { columns: ['created_at'], strategy: 'drop-only' }],
  },
];

type ConstraintInfo = {
  table: string;
  columns: string[];
  original?: 'index';
};

const constraints: ConstraintInfo[] = [
  { table: 'applications_roles', columns: ['application_id', 'role_id'] },
  { table: 'custom_phrases', columns: ['language_tag'] },
  { table: 'oidc_model_instances', columns: ['model_name', 'id'] },
  { table: 'roles_scopes', columns: ['role_id', 'scope_id'] },
  { table: 'users_roles', columns: ['user_id', 'role_id'] },
  { table: 'resources', columns: ['indicator'], original: 'index' },
  { table: 'roles', columns: ['name'], original: 'index' },
  { table: 'scopes', columns: ['resource_id', 'name'], original: 'index' },
];

const alteration: AlterationScript = {
  up: async (pool) => {
    // Add `tenant_id` column and create index accordingly
    await Promise.all(
      tables.map(async (tableName) => {
        // Add `tenant_id` column and set existing data to the default tenant
        await pool.query(sql`
          alter table ${getId(tableName)}
            add column ${tenantId} varchar(21) not null default 'default'
              references tenants (id) on update cascade on delete cascade;
        `);

        // Column should not have a default tenant ID, it should be always assigned manually or by a trigger
        await pool.query(sql`
          alter table ${getId(tableName)}
            alter column ${tenantId} drop default;
        `);

        // Skip OIDC model instances since we always query them with a model name
        if (tableName !== 'oidc_model_instances') {
          // Add ID index for better RLS query performance
          await pool.query(sql`
            create index ${getId(`${tableName}__id`)}
              on ${getId(tableName)} (${tenantId}, id);
          `);
        }
      })
    );

    // Update indexes
    await Promise.all(
      indexes.flatMap(({ table, indexes }) =>
        indexes.map(async ({ name, columns, strategy }) => {
          const indexName = getId(`${table}__${name ?? columns.join('_')}`);
          await pool.query(sql`drop index ${indexName}`);

          if (strategy !== 'drop-only') {
            await pool.query(
              sql`
                create index ${indexName} 
                  on ${getId(table)} (
                    ${tenantId},
                    ${sql.join(
                      columns.map((column) => sql.raw(column)),
                      sql`, `
                    )}
                  );
              `
            );
          }
        })
      )
    );

    // Update constraints
    await Promise.all(
      constraints.map(async ({ table, columns, original }) => {
        const indexName = getId(`${table}__${columns.join('_')}`);

        if (original === 'index') {
          await pool.query(sql`drop index ${indexName}`);
        }

        await pool.query(sql`
          alter table ${getId(table)}
            ${original === 'index' ? sql`` : sql`drop constraint ${indexName},`}
            add constraint ${indexName} unique (
              ${tenantId},
              ${sql.join(
                columns.map((column) => sql.raw(column)),
                sql`, `
              )}
            );
        `);
      })
    );
  },
  down: async (pool) => {
    // Restore constraints
    await Promise.all(
      constraints.map(async ({ table, columns, original }) => {
        const indexName = getId(`${table}__${columns.join('_')}`);

        await pool.query(sql`
          alter table ${getId(table)}
            drop constraint ${indexName};
        `);

        await (original === 'index'
          ? pool.query(sql`
            create unique index ${indexName}
              on ${getId(table)} (
                ${sql.join(
                  columns.map((column) => sql.raw(column)),
                  sql`, `
                )}
              )
          `)
          : pool.query(sql`
            alter table ${getId(table)}
              add constraint ${indexName} unique (
                ${sql.join(
                  columns.map((column) => sql.raw(column)),
                  sql`, `
                )}
              );
          `));
      })
    );

    // Restore indexes
    await Promise.all(
      indexes.flatMap(({ table, indexes }) =>
        indexes.map(async ({ name, columns, strategy }) => {
          const indexName = getId(`${table}__${name ?? columns.join('_')}`);

          if (strategy !== 'drop-only') {
            await pool.query(sql`drop index ${indexName}`);
          }

          await pool.query(
            sql`
              create index ${indexName} 
                on ${getId(table)} (
                  ${sql.join(
                    columns.map((column) => sql.raw(column)),
                    sql`, `
                  )}
                );
            `
          );
        })
      )
    );

    // Drop `tenant_id` column cascade
    await Promise.all(
      tables.map(async (tableName) => {
        // Add `tenant_id` column and set existing data to the default tenant
        await pool.query(sql`
          alter table ${getId(tableName)}
            drop column ${tenantId} cascade;
        `);
      })
    );
  },
};

export default alteration;
