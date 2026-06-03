import {
  applicationAccessControlGuard,
  type ApplicationAccessControl,
  Applications,
  ApplicationAccessControlOrgRoleRelations,
  ApplicationAccessControlOrganizationRelations,
  ApplicationAccessControlUserRelations,
  ApplicationAccessControlUserRoleRelations,
  OrganizationRoleUserRelations,
  OrganizationUserRelations,
  UsersRoles,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const applications = convertToIdentifiers(Applications);
const userRelations = convertToIdentifiers(ApplicationAccessControlUserRelations);
const userRoleRelations = convertToIdentifiers(ApplicationAccessControlUserRoleRelations);
const organizationRelations = convertToIdentifiers(ApplicationAccessControlOrganizationRelations);
const organizationRoleRelations = convertToIdentifiers(ApplicationAccessControlOrgRoleRelations);
const lookupUserRelations = convertToIdentifiers(ApplicationAccessControlUserRelations, true);
const lookupUserRoleRelations = convertToIdentifiers(
  ApplicationAccessControlUserRoleRelations,
  true
);
const lookupOrganizationRelations = convertToIdentifiers(
  ApplicationAccessControlOrganizationRelations,
  true
);
const lookupOrganizationRoleRelations = convertToIdentifiers(
  ApplicationAccessControlOrgRoleRelations,
  true
);
const usersRoles = convertToIdentifiers(UsersRoles, true);
const organizationUserRelations = convertToIdentifiers(OrganizationUserRelations, true);
const organizationRoleUserRelations = convertToIdentifiers(OrganizationRoleUserRelations, true);

export const createApplicationAccessControlQueries = (pool: CommonQueryMethods) => {
  const findApplicationAccessControl = async (
    applicationId: string
  ): Promise<ApplicationAccessControl> => {
    const accessControl = await pool.one<ApplicationAccessControl>(sql`
      select
        coalesce((
          select array_agg(${userRelations.fields.userId} order by ${userRelations.fields.userId})
          from ${userRelations.table}
          where ${userRelations.fields.applicationId} = ${applicationId}
        ), array[]::varchar[]) as "userIds",
        coalesce((
          select array_agg(
            ${userRoleRelations.fields.roleId}
            order by ${userRoleRelations.fields.roleId}
          )
          from ${userRoleRelations.table}
          where ${userRoleRelations.fields.applicationId} = ${applicationId}
        ), array[]::varchar[]) as "userRoleIds",
        coalesce((
          select array_agg(
            ${organizationRelations.fields.organizationId}
            order by ${organizationRelations.fields.organizationId}
          )
          from ${organizationRelations.table}
          where ${organizationRelations.fields.applicationId} = ${applicationId}
        ), array[]::varchar[]) as "organizationIds",
        coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'organizationId', organization_id,
              'organizationRoleIds', organization_role_ids
            )
            order by organization_id
          )
          from (
            select
              ${organizationRoleRelations.fields.organizationId} as organization_id,
              array_agg(
                ${organizationRoleRelations.fields.organizationRoleId}
                order by ${organizationRoleRelations.fields.organizationRoleId}
              ) as organization_role_ids
            from ${organizationRoleRelations.table}
            where ${organizationRoleRelations.fields.applicationId} = ${applicationId}
            group by ${organizationRoleRelations.fields.organizationId}
          ) organization_role_rules
        ), '[]'::jsonb) as "organizationRoleRules"
    `);

    return applicationAccessControlGuard.parse(accessControl);
  };

  const hasUserApplicationAccess = async (applicationId: string, userId: string) =>
    pool.exists(sql`
      select 1
      where exists (
        select 1
        from ${lookupUserRelations.table}
        where ${lookupUserRelations.fields.applicationId} = ${applicationId}
          and ${lookupUserRelations.fields.userId} = ${userId}
      ) or exists (
        select 1
        from ${lookupUserRoleRelations.table}
        join ${usersRoles.table}
          on ${usersRoles.fields.roleId} = ${lookupUserRoleRelations.fields.roleId}
        where ${lookupUserRoleRelations.fields.applicationId} = ${applicationId}
          and ${usersRoles.fields.userId} = ${userId}
      ) or exists (
        select 1
        from ${lookupOrganizationRelations.table}
        join ${organizationUserRelations.table}
          on ${organizationUserRelations.fields.organizationId} =
            ${lookupOrganizationRelations.fields.organizationId}
        where ${lookupOrganizationRelations.fields.applicationId} = ${applicationId}
          and ${organizationUserRelations.fields.userId} = ${userId}
      ) or exists (
        select 1
        from ${lookupOrganizationRoleRelations.table}
        join ${organizationRoleUserRelations.table}
          on ${organizationRoleUserRelations.fields.organizationId} =
              ${lookupOrganizationRoleRelations.fields.organizationId}
            and ${organizationRoleUserRelations.fields.organizationRoleId} =
              ${lookupOrganizationRoleRelations.fields.organizationRoleId}
        where ${lookupOrganizationRoleRelations.fields.applicationId} = ${applicationId}
          and ${organizationRoleUserRelations.fields.userId} = ${userId}
      )
    `);

  const replaceApplicationAccessControl = async (
    applicationId: string,
    {
      userIds,
      userRoleIds,
      organizationIds,
      organizationRoleRules: organizationRoleRuleGroups,
    }: ApplicationAccessControl
  ) =>
    pool.transaction(async (transaction) => {
      const organizationRoleRuleRows = organizationRoleRuleGroups.flatMap(
        ({ organizationId, organizationRoleIds }) =>
          organizationRoleIds.map((organizationRoleId) => ({
            organizationId,
            organizationRoleId,
          }))
      );

      const application = await transaction.maybeOne(sql`
        select 1
        from ${applications.table}
        where ${applications.fields.id} = ${applicationId}
        for update
      `);

      assertThat(
        application,
        new RequestError({
          code: 'entity.not_exists_with_id',
          status: 404,
          name: Applications.table,
          id: applicationId,
        })
      );

      await transaction.query(sql`
        delete from ${userRelations.table}
        where ${userRelations.fields.applicationId} = ${applicationId}
      `);
      await transaction.query(sql`
        delete from ${userRoleRelations.table}
        where ${userRoleRelations.fields.applicationId} = ${applicationId}
      `);
      await transaction.query(sql`
        delete from ${organizationRelations.table}
        where ${organizationRelations.fields.applicationId} = ${applicationId}
      `);
      await transaction.query(sql`
        delete from ${organizationRoleRelations.table}
        where ${organizationRoleRelations.fields.applicationId} = ${applicationId}
      `);

      if (userIds.length > 0) {
        await transaction.query(sql`
          insert into ${userRelations.table} (
            ${userRelations.fields.applicationId},
            ${userRelations.fields.userId}
          )
          values ${sql.join(
            userIds.map((userId) => sql`(${applicationId}, ${userId})`),
            sql`, `
          )}
        `);
      }

      if (userRoleIds.length > 0) {
        await transaction.query(sql`
          insert into ${userRoleRelations.table} (
            ${userRoleRelations.fields.applicationId},
            ${userRoleRelations.fields.roleId}
          )
          values ${sql.join(
            userRoleIds.map((roleId) => sql`(${applicationId}, ${roleId})`),
            sql`, `
          )}
        `);
      }

      if (organizationIds.length > 0) {
        await transaction.query(sql`
          insert into ${organizationRelations.table} (
            ${organizationRelations.fields.applicationId},
            ${organizationRelations.fields.organizationId}
          )
          values ${sql.join(
            organizationIds.map((organizationId) => sql`(${applicationId}, ${organizationId})`),
            sql`, `
          )}
        `);
      }

      if (organizationRoleRuleRows.length > 0) {
        await transaction.query(sql`
          insert into ${organizationRoleRelations.table} (
            ${organizationRoleRelations.fields.applicationId},
            ${organizationRoleRelations.fields.organizationId},
            ${organizationRoleRelations.fields.organizationRoleId}
          )
          values ${sql.join(
            organizationRoleRuleRows.map(
              ({ organizationId, organizationRoleId }) =>
                sql`(${applicationId}, ${organizationId}, ${organizationRoleId})`
            ),
            sql`, `
          )}
        `);
      }
    });

  return {
    findApplicationAccessControl,
    hasUserApplicationAccess,
    replaceApplicationAccessControl,
  };
};
