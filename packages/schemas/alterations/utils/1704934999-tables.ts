import { type CommonQueryMethods, sql } from '@silverhand/slonik';

const getId = (value: string) => sql.identifier([value]);

/**
 * Returns the suffix used in the base Logto role name for the current database
 * (`logto_tenant_<suffix>`).
 *
 * Historically the suffix was the raw database name (which may contain hyphens). A later
 * convention normalised it by replacing hyphens with underscores. To remain compatible with
 * both conventions we probe `pg_roles` for the normalised name first and fall back to the
 * raw database name for legacy installations.
 */
const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  const normalized = currentDatabase.replaceAll('-', '_');

  if (normalized === currentDatabase) {
    return currentDatabase;
  }

  const { exists } = await pool.one<{ exists: boolean }>(sql`
    select exists(
      select 1 from pg_roles where rolname = ${'logto_tenant_' + normalized}
    ) as exists;
  `);

  return exists ? normalized : currentDatabase;
};

/**
 * A function to call after the table is created. It will apply the necessary row-level security
 * policies and triggers to the table.
 */
export const applyTableRls = async (pool: CommonQueryMethods, tableName: string) => {
  const database = await getDatabaseName(pool);
  const baseRoleId = getId(`logto_tenant_${database}`);
  const table = getId(tableName);

  await pool.query(sql`
    create trigger set_tenant_id before insert on ${table}
      for each row execute procedure set_tenant_id();

    alter table ${table} enable row level security;

    create policy ${getId(`${tableName}_tenant_id`)} on ${table}
      as restrictive
      using (tenant_id = (select id from tenants where db_user = current_user));

    create policy ${getId(`${tableName}_modification`)} on ${table}
      using (true);

    grant select, insert, update, delete on ${table} to ${baseRoleId};
  `);
};

/**
 * A function to call before the table is dropped. It will remove the row-level security policies
 * and triggers from the table.
 */
export const dropTableRls = async (pool: CommonQueryMethods, tableName: string) => {
  await pool.query(sql`
    drop policy ${getId(`${tableName}_modification`)} on ${getId(tableName)};
    drop policy ${getId(`${tableName}_tenant_id`)} on ${getId(tableName)};
    drop trigger set_tenant_id on ${getId(tableName)};
  `);
};
