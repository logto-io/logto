import type { ApplicationsRole, CreateApplicationsRole } from '@logto/schemas';
import { ApplicationsRoles, RolesScopes } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(ApplicationsRoles);

export const createApplicationsRolesQueries = (pool: CommonQueryMethods) => {
  const findApplicationsRolesByApplicationId = async (applicationId: string) =>
    pool.any<ApplicationsRole>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.applicationId}=${applicationId}
    `);

  const insertApplicationsRoles = async (applicationsRoles: CreateApplicationsRole[]) =>
    pool.query(sql`
      insert into ${table} (${fields.applicationId}, ${fields.roleId}) values
      ${sql.join(
        applicationsRoles.map(({ applicationId, roleId }) => sql`(${applicationId}, ${roleId})`),
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
    findApplicationsRolesByApplicationId,
    insertApplicationsRoles,
    deleteApplicationRole,
  };
};
