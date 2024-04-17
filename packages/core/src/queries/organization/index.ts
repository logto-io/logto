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
  OrganizationRoleResourceScopeRelations,
  Scopes,
  Resources,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { type SearchOptions, buildSearchSql } from '#src/database/utils.js';
import { TwoRelationsQueries } from '#src/utils/RelationQueries.js';
import SchemaQueries from '#src/utils/SchemaQueries.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

import { RoleUserRelationQueries, UserRelationQueries } from './relations.js';

/**
 * The schema field keys that can be used for searching roles.
 */
export const organizationRoleSearchKeys = Object.freeze(['id', 'name', 'description'] as const);

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
    const resourceScopeRelations = convertToIdentifiers(
      OrganizationRoleResourceScopeRelations,
      true
    );
    const scopes = convertToIdentifiers(OrganizationScopes, true);
    const resourceScopes = convertToIdentifiers(Scopes, true);
    const resource = convertToIdentifiers(Resources, true);

    return sql<OrganizationRoleWithScopes>`
      select
        ${table}.*,
        coalesce(
          json_agg(distinct
            jsonb_build_object(
              'id', ${scopes.fields.id},
              'name', ${scopes.fields.name},
              'order', ${scopes.fields.id}
            )
          ) filter (where ${scopes.fields.id} is not null),
          '[]'
        ) as scopes, -- left join could produce nulls as scopes
        coalesce(
          json_agg(distinct
            jsonb_build_object(
              'id', ${resourceScopes.fields.id},
              'name', ${resourceScopes.fields.name},
              'resource', json_build_object(
                'id', ${resource.fields.id},
                'name', ${resource.fields.name}
              ),
              'order', ${resourceScopes.fields.id}
            )
          ) filter (where ${resourceScopes.fields.id} is not null),
          '[]'
        ) as "resourceScopes" -- left join could produce nulls as resourceScopes
      from ${table}
      left join ${relations.table}
        on ${relations.fields.organizationRoleId} = ${fields.id}
      left join ${scopes.table}
        on ${relations.fields.organizationScopeId} = ${scopes.fields.id}
      left join ${resourceScopeRelations.table}
        on ${resourceScopeRelations.fields.organizationRoleId} = ${fields.id}
      left join ${resourceScopes.table}
        on ${resourceScopeRelations.fields.scopeId} = ${resourceScopes.fields.id}
      left join ${resource.table}
        on ${resourceScopes.fields.resourceId} = ${resource.fields.id}
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

type OrganizationInvitationSearchOptions = {
  invitationId?: string;
  organizationId?: string;
  inviterId?: string;
  invitee?: string;
};

class OrganizationInvitationsQueries extends SchemaQueries<
  OrganizationInvitationKeys,
  CreateOrganizationInvitation,
  OrganizationInvitation
> {
  override async findById(invitationId: string): Promise<Readonly<OrganizationInvitationEntity>> {
    return this.pool.one(this.#findEntity({ invitationId }));
  }

  /** @deprecated Use `findEntities` instead. */
  override async findAll(): Promise<never> {
    throw new Error('Use `findEntities` instead.');
  }

  // We don't override `.findAll()` since the function signature is different from the base class.
  async findEntities(
    options: Omit<OrganizationInvitationSearchOptions, 'invitationId'>
  ): Promise<Readonly<OrganizationInvitationEntity[]>> {
    return this.pool.any(this.#findEntity({ ...options, invitationId: undefined }));
  }

  async updateExpiredEntities({
    organizationId,
    invitee,
  }: OrganizationInvitationSearchOptions): Promise<void> {
    const { table, fields } = convertToIdentifiers(OrganizationInvitations);
    await this.pool.query(sql`
      update ${table}
      set ${fields.status} = ${OrganizationInvitationStatus.Expired}
      where ${fields.status} = ${OrganizationInvitationStatus.Pending}
      and ${fields.expiresAt} < now()
      ${conditionalSql(organizationId, (id) => {
        return sql`and ${fields.organizationId} = ${id}`;
      })}
      ${conditionalSql(invitee, (email) => {
        return sql`and lower(${fields.invitee}) = lower(${email})`;
      })}
    `);
  }

  #findEntity({
    invitationId,
    organizationId,
    inviterId,
    invitee,
  }: OrganizationInvitationSearchOptions) {
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
      where true
      ${conditionalSql(invitationId, (id) => {
        return sql`and ${fields.id} = ${id}`;
      })}
      ${conditionalSql(organizationId, (id) => {
        return sql`and ${fields.organizationId} = ${id}`;
      })}
      ${conditionalSql(inviterId, (id) => {
        return sql`and ${fields.inviterId} = ${id}`;
      })}
      ${conditionalSql(invitee, (email) => {
        return sql`and lower(${fields.invitee}) = lower(${email})`;
      })}
      group by ${fields.id}
      ${conditionalSql(this.orderBy, ({ field, order }) => {
        return sql`order by ${fields[field]} ${order === 'desc' ? sql`desc` : sql`asc`}`;
      })}
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
    /** Queries for organization role - organization resource scope relations. */
    rolesResourceScopes: new TwoRelationsQueries(
      this.pool,
      OrganizationRoleResourceScopeRelations.table,
      OrganizationRoles,
      Scopes
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
