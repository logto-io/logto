import { type UserScope } from '@logto/core-kit';
import {
  CimdGrantClientSnapshots,
  CimdGrantOrganizations,
  CimdOrganizationResourceScopes,
  CimdOrganizationScopes,
  CimdResourceScopes,
  CimdUserScopes,
  OidcModelInstances,
  OrganizationScopes,
  Scopes,
  type CimdGrantClientSnapshot,
  type OrganizationScope,
  type Scope,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import {
  buildBatchInsertIntoWithPool,
  buildInsertIntoWithPool,
} from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const cimdUserScopes = convertToIdentifiers(CimdUserScopes, true);

const createUserScopeQueries = (pool: CommonQueryMethods) => {
  const batchInsert = buildBatchInsertIntoWithPool(pool)(CimdUserScopes, {
    onConflict: { ignore: true },
  });

  const insert = async (userScopes: readonly UserScope[]) =>
    batchInsert(userScopes.map((userScope) => ({ userScope })));

  /** Ordered so the client scope string issued from this ceiling is deterministic. */
  const findAll = async (): Promise<UserScope[]> => {
    const rows = await pool.any<{ userScope: UserScope }>(sql`
      select ${cimdUserScopes.fields.userScope}
      from ${cimdUserScopes.table}
      order by ${cimdUserScopes.fields.userScope}
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
  const batchInsert = buildBatchInsertIntoWithPool(pool)(CimdResourceScopes, {
    onConflict: { ignore: true },
  });

  const insert = async (scopeIds: readonly string[]) =>
    batchInsert(scopeIds.map((scopeId) => ({ scopeId })));

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
  const batchInsert = buildBatchInsertIntoWithPool(pool)(CimdOrganizationScopes, {
    onConflict: { ignore: true },
  });

  const insert = async (organizationScopeIds: readonly string[]) =>
    batchInsert(organizationScopeIds.map((organizationScopeId) => ({ organizationScopeId })));

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
  const batchInsert = buildBatchInsertIntoWithPool(pool)(CimdOrganizationResourceScopes, {
    onConflict: { ignore: true },
  });

  const insert = async (scopeIds: readonly string[]) =>
    batchInsert(scopeIds.map((scopeId) => ({ scopeId })));

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

const cimdGrantOrganizations = convertToIdentifiers(CimdGrantOrganizations, true);

const createGrantOrganizationQueries = (pool: CommonQueryMethods) => {
  /** Idempotent so a retried consent submission re-writes the same row instead of failing. */
  const insert = buildInsertIntoWithPool(pool)(CimdGrantOrganizations, {
    onConflict: { ignore: true },
  });

  /**
   * Whether the organization was authorized on the given grant. Row presence is only an
   * additional condition on top of a provider-validated live grant, never a validity source:
   * rows live as long as the Grant *row*, which can outlast the grant's validity by up to the
   * pruning retention.
   */
  const exists = async (grantId: string, organizationId: string) =>
    pool.exists(sql`
      select 1
      from ${cimdGrantOrganizations.table}
      where ${cimdGrantOrganizations.fields.grantId} = ${grantId}
      and ${cimdGrantOrganizations.fields.organizationId} = ${organizationId}
    `);

  const findOrganizationIds = async (grantId: string) => {
    const rows = await pool.any<{ organizationId: string }>(sql`
      select ${cimdGrantOrganizations.fields.organizationId}
      from ${cimdGrantOrganizations.table}
      where ${cimdGrantOrganizations.fields.grantId} = ${grantId}
    `);
    return rows.map(({ organizationId }) => organizationId);
  };

  return { insert, exists, findOrganizationIds };
};

const cimdGrantClientSnapshots = convertToIdentifiers(CimdGrantClientSnapshots, true);
const oidcModelInstances = convertToIdentifiers(OidcModelInstances, true);

const createGrantClientSnapshotQueries = (pool: CommonQueryMethods) => {
  /** Idempotent so a retried consent submission does not fail; the first write wins. */
  const insert = buildInsertIntoWithPool(pool)(CimdGrantClientSnapshots, {
    onConflict: { ignore: true },
  });

  /**
   * The latest consent snapshot the user has approved for a client identifier. Scoping to
   * the user's own grants keeps the display name out of reach of anyone else's consent —
   * an unvetted client cannot rewrite what this user sees by re-authorizing elsewhere.
   * Snapshots live as long as their Grant rows, so a user whose grants are all revoked
   * and pruned resolves to nothing — the identifier itself stays the permanent identity
   * signal.
   */
  const findUserLatestByClientId = async (userId: string, clientId: string) => {
    /** The snapshot table also has a `tenant_id` column, so this side of the join must qualify. */
    const snapshotTenantId = sql.identifier([
      CimdGrantClientSnapshots.table,
      CimdGrantClientSnapshots.fields.tenantId,
    ]);

    return pool.maybeOne<CimdGrantClientSnapshot>(sql`
      select ${cimdGrantClientSnapshots.table}.*
      from ${cimdGrantClientSnapshots.table}
      inner join ${oidcModelInstances.table}
        on ${oidcModelInstances.fields.tenantId} = ${snapshotTenantId}
        and ${oidcModelInstances.fields.modelName} = ${cimdGrantClientSnapshots.fields.grantModelName}
        and ${oidcModelInstances.fields.id} = ${cimdGrantClientSnapshots.fields.grantId}
      where ${cimdGrantClientSnapshots.fields.clientId} = ${clientId}
        and ${oidcModelInstances.fields.payload} ->> 'accountId' = ${userId}
      order by ${cimdGrantClientSnapshots.fields.createdAt} desc
      limit 1
    `);
  };

  return { insert, findUserLatestByClientId };
};

export const createCimdQueries = (pool: CommonQueryMethods) => ({
  userScopes: createUserScopeQueries(pool),
  resourceScopes: createResourceScopeQueries(pool),
  organizationScopes: createOrganizationScopeQueries(pool),
  organizationResourceScopes: createOrganizationResourceScopeQueries(pool),
  grantOrganizations: createGrantOrganizationQueries(pool),
  grantClientSnapshots: createGrantClientSnapshotQueries(pool),
});
