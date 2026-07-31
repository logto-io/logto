import { type UserScope } from '@logto/core-kit';
import {
  CimdOrganizationResourceScopes,
  CimdOrganizationScopes,
  CimdResourceScopes,
  CimdUserScopes,
  OrganizationScopes,
  Scopes,
  type OrganizationScope,
  type Scope,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const cimdUserScopes = convertToIdentifiers(CimdUserScopes, true);

const createUserScopeQueries = (pool: CommonQueryMethods) => {
  const insert = async (userScopes: readonly UserScope[]) => {
    if (userScopes.length === 0) {
      return;
    }

    await pool.query(sql`
      insert into ${cimdUserScopes.table} (${sql.identifier([CimdUserScopes.fields.userScope])})
      values ${sql.join(
        userScopes.map((userScope) => sql`(${userScope})`),
        sql`, `
      )}
      on conflict do nothing
    `);
  };

  const findAll = async (): Promise<UserScope[]> => {
    const rows = await pool.any<{ userScope: UserScope }>(sql`
      select ${cimdUserScopes.fields.userScope}
      from ${cimdUserScopes.table}
    `);
    return rows.map(({ userScope }) => userScope);
  };

  const deleteByUserScope = async (userScope: UserScope) => {
    const { rowCount } = await pool.query(sql`
      delete from ${cimdUserScopes.table}
      where ${cimdUserScopes.fields.userScope} = ${userScope}
    `);
    if (rowCount < 1) {
      throw new DeletionError(CimdUserScopes.table);
    }
  };

  return { insert, findAll, delete: deleteByUserScope };
};

const cimdResourceScopes = convertToIdentifiers(CimdResourceScopes, true);
const scopes = convertToIdentifiers(Scopes, true);

const createResourceScopeQueries = (pool: CommonQueryMethods) => {
  const insert = async (scopeIds: readonly string[]) => {
    if (scopeIds.length === 0) {
      return;
    }

    await pool.query(sql`
      insert into ${cimdResourceScopes.table} (${sql.identifier([CimdResourceScopes.fields.scopeId])})
      values ${sql.join(
        scopeIds.map((scopeId) => sql`(${scopeId})`),
        sql`, `
      )}
      on conflict do nothing
    `);
  };

  const findAll = async (): Promise<readonly Scope[]> =>
    pool.any<Scope>(sql`
      select ${scopes.table}.*
      from ${cimdResourceScopes.table}
      join ${scopes.table} on ${scopes.fields.id} = ${cimdResourceScopes.fields.scopeId}
    `);

  const deleteByScopeId = async (scopeId: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${cimdResourceScopes.table}
      where ${cimdResourceScopes.fields.scopeId} = ${scopeId}
    `);
    if (rowCount < 1) {
      throw new DeletionError(CimdResourceScopes.table);
    }
  };

  return { insert, findAll, delete: deleteByScopeId };
};

const cimdOrganizationScopes = convertToIdentifiers(CimdOrganizationScopes, true);
const organizationScopes = convertToIdentifiers(OrganizationScopes, true);

const createOrganizationScopeQueries = (pool: CommonQueryMethods) => {
  const insert = async (organizationScopeIds: readonly string[]) => {
    if (organizationScopeIds.length === 0) {
      return;
    }

    await pool.query(sql`
      insert into ${cimdOrganizationScopes.table} (${sql.identifier([
        CimdOrganizationScopes.fields.organizationScopeId,
      ])})
      values ${sql.join(
        organizationScopeIds.map((organizationScopeId) => sql`(${organizationScopeId})`),
        sql`, `
      )}
      on conflict do nothing
    `);
  };

  const findAll = async (): Promise<readonly OrganizationScope[]> =>
    pool.any<OrganizationScope>(sql`
      select ${organizationScopes.table}.*
      from ${cimdOrganizationScopes.table}
      join ${organizationScopes.table} on ${organizationScopes.fields.id} = ${cimdOrganizationScopes.fields.organizationScopeId}
    `);

  const deleteByOrganizationScopeId = async (organizationScopeId: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${cimdOrganizationScopes.table}
      where ${cimdOrganizationScopes.fields.organizationScopeId} = ${organizationScopeId}
    `);
    if (rowCount < 1) {
      throw new DeletionError(CimdOrganizationScopes.table);
    }
  };

  return { insert, findAll, delete: deleteByOrganizationScopeId };
};

const cimdOrganizationResourceScopes = convertToIdentifiers(CimdOrganizationResourceScopes, true);

const createOrganizationResourceScopeQueries = (pool: CommonQueryMethods) => {
  const insert = async (scopeIds: readonly string[]) => {
    if (scopeIds.length === 0) {
      return;
    }

    await pool.query(sql`
      insert into ${cimdOrganizationResourceScopes.table} (${sql.identifier([
        CimdOrganizationResourceScopes.fields.scopeId,
      ])})
      values ${sql.join(
        scopeIds.map((scopeId) => sql`(${scopeId})`),
        sql`, `
      )}
      on conflict do nothing
    `);
  };

  const findAll = async (): Promise<readonly Scope[]> =>
    pool.any<Scope>(sql`
      select ${scopes.table}.*
      from ${cimdOrganizationResourceScopes.table}
      join ${scopes.table} on ${scopes.fields.id} = ${cimdOrganizationResourceScopes.fields.scopeId}
    `);

  const deleteByScopeId = async (scopeId: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${cimdOrganizationResourceScopes.table}
      where ${cimdOrganizationResourceScopes.fields.scopeId} = ${scopeId}
    `);
    if (rowCount < 1) {
      throw new DeletionError(CimdOrganizationResourceScopes.table);
    }
  };

  return { insert, findAll, delete: deleteByScopeId };
};

export const createCimdQueries = (pool: CommonQueryMethods) => ({
  userScopes: createUserScopeQueries(pool),
  resourceScopes: createResourceScopeQueries(pool),
  organizationScopes: createOrganizationScopeQueries(pool),
  organizationResourceScopes: createOrganizationResourceScopeQueries(pool),
});
