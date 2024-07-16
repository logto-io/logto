import {
  Organizations,
  Applications,
  OrganizationApplicationRelations,
  type Application,
  OrganizationRoles,
  OrganizationRoleApplicationRelations,
  type ApplicationWithOrganizationRoles,
  type OrganizationWithRoles,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { type SearchOptions, buildSearchSql } from '#src/database/utils.js';
import { TwoRelationsQueries, type GetEntitiesOptions } from '#src/utils/RelationQueries.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

import { type applicationSearchKeys } from '../application.js';

import { aggregateRoles } from './utils.js';

export class ApplicationRelationQueries extends TwoRelationsQueries<
  typeof Organizations,
  typeof Applications
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationApplicationRelations.table, Organizations, Applications);
  }

  async getOrganizationsByApplicationId(
    applicationId: string,
    options?: GetEntitiesOptions
  ): Promise<[totalCount: number, organizations: readonly OrganizationWithRoles[]]> {
    const organizations = convertToIdentifiers(Organizations, true);
    const roles = convertToIdentifiers(OrganizationRoles, true);
    const { fields } = convertToIdentifiers(OrganizationApplicationRelations, true);
    const relations = convertToIdentifiers(OrganizationRoleApplicationRelations, true);

    const [{ count }, entities] = await Promise.all([
      this.pool.one<{ count: string }>(sql`
        select count(*)
        from ${this.table}
        left join ${organizations.table}
          on ${fields.organizationId} = ${organizations.fields.id}
        where ${fields.applicationId} = ${applicationId}
      `),
      this.pool.any<OrganizationWithRoles>(sql`
        select
          ${sql.join(Object.values(organizations.fields), sql`, `)},
          ${aggregateRoles()}
        from ${this.table}
        left join ${organizations.table}
          on ${fields.organizationId} = ${organizations.fields.id}
        left join ${relations.table}
          on ${relations.fields.organizationId} = ${organizations.fields.id}
          and ${relations.fields.applicationId} = ${fields.applicationId}
        left join ${roles.table}
          on ${relations.fields.organizationRoleId} = ${roles.fields.id}
        where ${fields.applicationId} = ${applicationId}
        group by ${organizations.fields.id}
        ${conditionalSql(options, ({ limit, offset }) => sql`limit ${limit} offset ${offset}`)}
      `),
    ]);

    return [Number(count), entities];
  }

  /** Get the applications of an organization with their organization roles. */
  async getApplicationsByOrganizationId(
    organizationId: string,
    { limit, offset }: GetEntitiesOptions,
    search?: SearchOptions<(typeof applicationSearchKeys)[number]>
  ): Promise<[totalCount: number, applications: readonly Application[]]> {
    const roles = convertToIdentifiers(OrganizationRoles, true);
    const applications = convertToIdentifiers(Applications, true);
    const { fields } = convertToIdentifiers(OrganizationApplicationRelations, true);
    const relations = convertToIdentifiers(OrganizationRoleApplicationRelations, true);

    const [{ count }, entities] = await Promise.all([
      this.pool.one<{ count: string }>(sql`
        select count(*)
        from ${this.table}
        left join ${applications.table}
          on ${fields.applicationId} = ${applications.fields.id}
        where ${fields.organizationId} = ${organizationId}
        ${buildSearchSql(Applications, search, sql`and `)}
      `),
      this.pool.any<ApplicationWithOrganizationRoles>(sql`
        select
          ${sql.join(Object.values(applications.fields), sql`, `)},
          ${aggregateRoles()}
        from ${this.table}
        left join ${applications.table}
          on ${fields.applicationId} = ${applications.fields.id}
        left join ${relations.table}
          on ${relations.fields.applicationId} = ${applications.fields.id}
          and ${relations.fields.organizationId} = ${fields.organizationId}
        left join ${roles.table}
          on ${relations.fields.organizationRoleId} = ${roles.fields.id}
        where ${fields.organizationId} = ${organizationId}
        ${buildSearchSql(Applications, search, sql`and `)}
        group by ${applications.fields.id}
        limit ${limit}
        offset ${offset}
      `),
    ]);

    return [Number(count), entities];
  }
}
