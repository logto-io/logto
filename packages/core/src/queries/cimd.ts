import { type UserScope } from '@logto/core-kit';
import {
  CimdOrganizationResourceScopes,
  CimdOrganizationScopes,
  CimdResourceScopes,
  CimdUserScopes,
  OrganizationScopes,
  Resources,
  Scopes,
  type OrganizationScope,
  type Scope,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

/**
 * Queries for the tenant-level client ID metadata document (CIMD) permission ceiling relations.
 * All tables are tenant-owned; row-level security scopes every query to the current tenant.
 */
export const createCimdQueries = (pool: CommonQueryMethods) => {
  const insertUserScopes = buildInsertIntoWithPool(pool)(CimdUserScopes, {
    onConflict: { ignore: true },
  });
  const insertResourceScopes = buildInsertIntoWithPool(pool)(CimdResourceScopes, {
    onConflict: { ignore: true },
  });
  const insertOrganizationScopes = buildInsertIntoWithPool(pool)(CimdOrganizationScopes, {
    onConflict: { ignore: true },
  });
  const insertOrganizationResourceScopes = buildInsertIntoWithPool(pool)(
    CimdOrganizationResourceScopes,
    { onConflict: { ignore: true } }
  );

  const findAllUserScopes = async (): Promise<UserScope[]> => {
    const { table, fields } = convertToIdentifiers(CimdUserScopes);
    const rows = await pool.any<{ userScope: UserScope }>(sql`
      select ${fields.userScope}
      from ${table}
    `);
    return rows.map(({ userScope }) => userScope);
  };

  const deleteUserScope = async (userScope: string) => {
    const { table, fields } = convertToIdentifiers(CimdUserScopes);
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.userScope} = ${userScope}
    `);
    if (rowCount < 1) {
      throw new DeletionError(CimdUserScopes.table);
    }
  };

  const findAllResourceScopes = async (): Promise<readonly Scope[]> => {
    const relation = convertToIdentifiers(CimdResourceScopes, true);
    const scopes = convertToIdentifiers(Scopes, true);
    return pool.any<Scope>(sql`
      select ${scopes.table}.*
      from ${relation.table}
      join ${scopes.table} on ${scopes.fields.id} = ${relation.fields.scopeId}
    `);
  };

  const findAllOrganizationResourceScopes = async (): Promise<readonly Scope[]> => {
    const relation = convertToIdentifiers(CimdOrganizationResourceScopes, true);
    const scopes = convertToIdentifiers(Scopes, true);
    return pool.any<Scope>(sql`
      select ${scopes.table}.*
      from ${relation.table}
      join ${scopes.table} on ${scopes.fields.id} = ${relation.fields.scopeId}
    `);
  };

  const findResourceScopesByIndicator = async (indicator: string): Promise<readonly Scope[]> => {
    const relation = convertToIdentifiers(CimdResourceScopes, true);
    const scopes = convertToIdentifiers(Scopes, true);
    const resources = convertToIdentifiers(Resources, true);
    return pool.any<Scope>(sql`
      select ${scopes.table}.*
      from ${relation.table}
      join ${scopes.table} on ${scopes.fields.id} = ${relation.fields.scopeId}
      join ${resources.table} on ${resources.fields.id} = ${scopes.fields.resourceId}
      where ${resources.fields.indicator} = ${indicator}
    `);
  };

  const findOrganizationResourceScopesByIndicator = async (
    indicator: string
  ): Promise<readonly Scope[]> => {
    const relation = convertToIdentifiers(CimdOrganizationResourceScopes, true);
    const scopes = convertToIdentifiers(Scopes, true);
    const resources = convertToIdentifiers(Resources, true);
    return pool.any<Scope>(sql`
      select ${scopes.table}.*
      from ${relation.table}
      join ${scopes.table} on ${scopes.fields.id} = ${relation.fields.scopeId}
      join ${resources.table} on ${resources.fields.id} = ${scopes.fields.resourceId}
      where ${resources.fields.indicator} = ${indicator}
    `);
  };

  const deleteResourceScope = async (scopeId: string) => {
    const { table, fields } = convertToIdentifiers(CimdResourceScopes);
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.scopeId} = ${scopeId}
    `);
    if (rowCount < 1) {
      throw new DeletionError(CimdResourceScopes.table);
    }
  };

  const findAllOrganizationScopes = async (): Promise<readonly OrganizationScope[]> => {
    const relation = convertToIdentifiers(CimdOrganizationScopes, true);
    const organizationScopes = convertToIdentifiers(OrganizationScopes, true);
    return pool.any<OrganizationScope>(sql`
      select ${organizationScopes.table}.*
      from ${relation.table}
      join ${organizationScopes.table} on ${organizationScopes.fields.id} = ${relation.fields.organizationScopeId}
    `);
  };

  const deleteOrganizationScope = async (organizationScopeId: string) => {
    const { table, fields } = convertToIdentifiers(CimdOrganizationScopes);
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.organizationScopeId} = ${organizationScopeId}
    `);
    if (rowCount < 1) {
      throw new DeletionError(CimdOrganizationScopes.table);
    }
  };

  const deleteOrganizationResourceScope = async (scopeId: string) => {
    const { table, fields } = convertToIdentifiers(CimdOrganizationResourceScopes);
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.scopeId} = ${scopeId}
    `);
    if (rowCount < 1) {
      throw new DeletionError(CimdOrganizationResourceScopes.table);
    }
  };

  return {
    insertUserScopes,
    insertResourceScopes,
    insertOrganizationScopes,
    insertOrganizationResourceScopes,
    findAllUserScopes,
    deleteUserScope,
    findAllResourceScopes,
    findAllOrganizationResourceScopes,
    findResourceScopesByIndicator,
    findOrganizationResourceScopesByIndicator,
    deleteResourceScope,
    findAllOrganizationScopes,
    deleteOrganizationScope,
    deleteOrganizationResourceScope,
  };
};
