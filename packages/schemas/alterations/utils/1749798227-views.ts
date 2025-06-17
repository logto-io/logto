import { type CommonQueryMethods, sql } from '@silverhand/slonik';

const getId = (value: string) => sql.identifier([value]);

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

export const grantViewAccess = async (pool: CommonQueryMethods, viewName: string) => {
  const database = await getDatabaseName(pool);
  const baseRoleId = getId(`logto_tenant_${database}`);
  const view = getId(viewName);

  await pool.query(sql`
    grant select, insert, update, delete on ${view} to ${baseRoleId};
  `);
};
