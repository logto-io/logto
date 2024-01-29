import {
  type Organization,
  type CreateOrganization,
  type OrganizationKeys,
  Organizations,
  OrganizationRoles,
  OrganizationScopes,
  OrganizationRoleScopeRelations,
  type OrganizationRoleKeys,
  type CreateOrganizationRole,
  type OrganizationRole,
  type OrganizationRoleWithScopes,
  OrganizationInvitations,
  type OrganizationInvitationKeys,
  type CreateOrganizationInvitation,
  type OrganizationInvitation,
  type OrganizationInvitationEntity,
  OrganizationInvitationRoleRelations,
  OrganizationInvitationStatus,
} from '@logto/schemas';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { sql, type CommonQueryMethods } from 'slonik';

import { type SearchOptions, buildSearchSql } from '#src/database/utils.js';
import { TwoRelationsQueries } from '#src/utils/RelationQueries.js';
import SchemaQueries from '#src/utils/SchemaQueries.js';

import { RoleUserRelationQueries, UserRelationQueries } from './relations.js';

class OrganizationRolesQueries extends SchemaQueries<
  OrganizationRoleKeys,
  CreateOrganizationRole,
  OrganizationRole
> {
  override async findById(id: string): Promise<Readonly<OrganizationRoleWithScopes>> {
    return this.pool.one(this.#findWithScopesSql(id));
  }

  override async findAll(
    limit: number,
    offset: number,
    search?: SearchOptions<OrganizationRoleKeys>
  ): Promise<[totalNumber: number, rows: Readonly<OrganizationRoleWithScopes[]>]> {
    return Promise.all([
      this.findTotalNumber(search),
      this.pool.any(this.#findWithScopesSql(undefined, limit, offset, search)),
    ]);
  }

  #findWithScopesSql(
    roleId?: string,
    limit = 1,
    offset = 0,
    search?: SearchOptions<OrganizationRoleKeys>
  ) {
    const { table, fields } = convertToIdentifiers(OrganizationRoles, true);
    const relations = convertToIdentifiers(OrganizationRoleScopeRelations, true);
    const scopes = convertToIdentifiers(OrganizationScopes, true);

    return sql<OrganizationRoleWithScopes>`
      select
        ${table}.*,
        coalesce(
          json_agg(
            json_build_object(
              'id', ${scopes.fields.id},
              'name', ${scopes.fields.name}
            ) order by ${scopes.fields.name}
          ) filter (where ${scopes.fields.id} is not null),
          '[]'
        ) as scopes -- left join could produce nulls as scopes
      from ${table}
      left join ${relations.table}
        on ${relations.fields.organizationRoleId} = ${fields.id}
      left join ${scopes.table}
        on ${relations.fields.organizationScopeId} = ${scopes.fields.id}
      ${conditionalSql(roleId, (id) => {
        return sql`where ${fields.id} = ${id}`;
      })}
      ${buildSearchSql(OrganizationRoles, search)}
      group by ${fields.id}
      ${conditionalSql(this.orderBy, ({ field, order }) => {
        return sql`order by ${fields[field]} ${order === 'desc' ? sql`desc` : sql`asc`}`;
      })}
      limit ${limit}
      offset ${offset}
    `;
  }
}

class OrganizationInvitationsQueries extends SchemaQueries<
  OrganizationInvitationKeys,
  CreateOrganizationInvitation,
  OrganizationInvitation
> {
  override async findById(id: string): Promise<Readonly<OrganizationInvitationEntity>> {
    return this.pool.one(this.#findEntity(id));
  }

  override async findAll(
    limit: number,
    offset: number,
    search?: SearchOptions<OrganizationInvitationKeys>
  ): Promise<[totalNumber: number, rows: Readonly<OrganizationInvitationEntity[]>]> {
    return Promise.all([
      this.findTotalNumber(search),
      this.pool.any(this.#findEntity(undefined, limit, offset, search)),
    ]);
  }

  #findEntity(
    invitationId?: string,
    limit = 1,
    offset = 0,
    search?: SearchOptions<OrganizationInvitationKeys>
  ) {
    const { table, fields } = convertToIdentifiers(OrganizationInvitations, true);
    const roleRelations = convertToIdentifiers(OrganizationInvitationRoleRelations, true);
    const roles = convertToIdentifiers(OrganizationRoles, true);

    return sql<OrganizationInvitationEntity>`
      select
        ${sql.join(
          Object.values(fields).filter((field) => field !== fields.status),
          sql`, `
        )},
        -- Dynamically calculate the status of the invitation, note that the
        -- actual status of the invitation is not changed.
        case
          when 
            ${fields.status} = ${OrganizationInvitationStatus.Pending} and
            ${fields.expiresAt} < now()
          then ${OrganizationInvitationStatus.Expired}
          else ${fields.status}
        end as "status",
        coalesce(
          json_agg(
            json_build_object(
              'id', ${roles.fields.id},
              'name', ${roles.fields.name}
            ) order by ${roles.fields.name}
          ) filter (where ${roles.fields.id} is not null),
          '[]'
        ) as "organizationRoles" -- left join could produce nulls
      from ${table}
      left join ${roleRelations.table}
        on ${roleRelations.fields.organizationInvitationId} = ${fields.id}
      left join ${roles.table}
        on ${roles.fields.id} = ${roleRelations.fields.organizationRoleId}
      ${conditionalSql(invitationId, (id) => {
        return sql`where ${fields.id} = ${id}`;
      })}
      ${buildSearchSql(OrganizationInvitations, search)}
      group by ${fields.id}
      ${conditionalSql(this.orderBy, ({ field, order }) => {
        return sql`order by ${fields[field]} ${order === 'desc' ? sql`desc` : sql`asc`}`;
      })}
      limit ${limit}
      offset ${offset}
    `;
  }
}

export default class OrganizationQueries extends SchemaQueries<
  OrganizationKeys,
  CreateOrganization,
  Organization
> {
  /**
   * Queries for roles in the organization template.
   * @see {@link OrganizationRoles}
   */
  roles = new OrganizationRolesQueries(this.pool, OrganizationRoles, {
    field: 'name',
    order: 'asc',
  });

  /**
   * Queries for scopes in the organization template.
   * @see {@link OrganizationScopes}
   */
  scopes = new SchemaQueries(this.pool, OrganizationScopes, { field: 'name', order: 'asc' });

  /**
   * Queries for organization invitations.
   * @see {@link OrganizationInvitations}
   */
  invitations = new OrganizationInvitationsQueries(this.pool, OrganizationInvitations, {
    field: 'createdAt',
    order: 'desc',
  });

  /** Queries for relations that connected with organization-related entities. */
  relations = {
    /** Queries for organization role - organization scope relations. */
    rolesScopes: new TwoRelationsQueries(
      this.pool,
      OrganizationRoleScopeRelations.table,
      OrganizationRoles,
      OrganizationScopes
    ),
    /** Queries for organization - user relations. */
    users: new UserRelationQueries(this.pool),
    /** Queries for organization - organization role - user relations. */
    rolesUsers: new RoleUserRelationQueries(this.pool),
    invitationsRoles: new TwoRelationsQueries(
      this.pool,
      OrganizationInvitationRoleRelations.table,
      OrganizationInvitations,
      OrganizationRoles
    ),
  };

  constructor(pool: CommonQueryMethods) {
    super(pool, Organizations);
  }
}
