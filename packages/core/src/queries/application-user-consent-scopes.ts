import { type UserScope } from '@logto/core-kit';
import {
  ApplicationUserConsentOrganizationScopes,
  ApplicationUserConsentResourceScopes,
  ApplicationUserConsentOrganizationResourceScopes,
  ApplicationUserConsentUserScopes,
  Applications,
  OrganizationScopes,
  Scopes,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { TwoRelationsQueries } from '#src/utils/RelationQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

export class ApplicationUserConsentOrganizationScopeQueries extends TwoRelationsQueries<
  typeof Applications,
  typeof OrganizationScopes
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, ApplicationUserConsentOrganizationScopes.table, Applications, OrganizationScopes);
  }
}

export class ApplicationUserConsentResourceScopeQueries extends TwoRelationsQueries<
  typeof Applications,
  typeof Scopes
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, ApplicationUserConsentResourceScopes.table, Applications, Scopes);
  }
}

export class ApplicationUserConsentOrganizationResourceScopeQueries extends TwoRelationsQueries<
  typeof Applications,
  typeof Scopes
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, ApplicationUserConsentOrganizationResourceScopes.table, Applications, Scopes);
  }
}

export const createApplicationUserConsentUserScopeQueries = (pool: CommonQueryMethods) => {
  const insert = buildInsertIntoWithPool(pool)(ApplicationUserConsentUserScopes, {
    onConflict: { ignore: true },
  });

  const findAllByApplicationId = async (applicationId: string) => {
    const { table, fields } = convertToIdentifiers(ApplicationUserConsentUserScopes);

    const scopes = await pool.any<{ userScope: UserScope }>(sql`
      select ${fields.userScope}
      from ${table}
      where ${fields.applicationId} = ${applicationId}
    `);

    return scopes.map(({ userScope }) => userScope);
  };

  const deleteByApplicationIdAndScopeId = async (applicationId: string, scopeId: string) => {
    const { table, fields } = convertToIdentifiers(ApplicationUserConsentUserScopes);

    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.applicationId} = ${applicationId} and ${fields.userScope} = ${scopeId}
    `);

    if (rowCount < 1) {
      throw new DeletionError(ApplicationUserConsentUserScopes.table);
    }
  };

  return {
    insert,
    findAllByApplicationId,
    deleteByApplicationIdAndScopeId,
  };
};
