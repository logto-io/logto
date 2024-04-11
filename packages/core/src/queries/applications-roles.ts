import type { ApplicationsRole, CreateApplicationsRole, Role } from '@logto/schemas';
import { Roles, ApplicationsRoles, RolesScopes } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers, conditionalSql } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(ApplicationsRoles, true);
const { fields: insertFields } = convertToIdentifiers(ApplicationsRoles);

export const createApplicationsRolesQueries = (pool: CommonQueryMethods) => {
  const findFirstApplicationsRolesByRoleIdAndApplicationIds = async (
    roleId: string,
    applicationIds: string[]
  ): Promise<Nullable<ApplicationsRole>> =>
    applicationIds.length > 0
      ? pool.maybeOne<ApplicationsRole>(sql`
        select ${sql.join(Object.values(fields), sql`,`)}
        from ${table}
        where ${fields.roleId}=${roleId}
        and ${fields.applicationId} in (${sql.join(applicationIds, sql`, `)})
        limit 1
      `)
      : null;

  const countApplicationsRolesByRoleId = async (roleId: string) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      where ${fields.roleId}=${roleId}
    `);

  const findApplicationsRolesByApplicationId = async (applicationId: string) =>
    pool.any<ApplicationsRole & { role: Role }>(sql`
      select
        ${sql.join(Object.values(fields), sql`,`)},
        to_jsonb(${sql.identifier([Roles.table])}) as role
      from ${table}
      join roles on ${sql.identifier([Roles.table, Roles.fields.id])} = ${fields.roleId}
      where ${fields.applicationId}=${applicationId}
    `);

  const findApplicationsRolesByRoleId = async (roleId: string, limit?: number) =>
    pool.any<ApplicationsRole>(sql`
      select
        ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.roleId}=${roleId}
      ${conditionalSql(limit, (value) => sql`limit ${value}`)}
    `);

  const insertApplicationsRoles = async (applicationsRoles: CreateApplicationsRole[]) =>
    pool.query(sql`
      insert into ${table} (${insertFields.id}, ${insertFields.applicationId}, ${
        insertFields.roleId
      }) values
      ${sql.join(
        applicationsRoles.map(
          ({ id, applicationId, roleId }) => sql`(${id}, ${applicationId}, ${roleId})`
        ),
        sql`, `
      )}
    `);

  const deleteApplicationRole = async (applicationId: string, roleId: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.applicationId} = ${applicationId} and ${fields.roleId} = ${roleId}
    `);

    if (rowCount < 1) {
      throw new DeletionError(RolesScopes.table);
    }
  };

  return {
    findFirstApplicationsRolesByRoleIdAndApplicationIds,
    countApplicationsRolesByRoleId,
    findApplicationsRolesByApplicationId,
    findApplicationsRolesByRoleId,
    insertApplicationsRoles,
    deleteApplicationRole,
  };
};
