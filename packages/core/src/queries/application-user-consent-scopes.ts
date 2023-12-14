import { type UserScope } from '@logto/core-kit';
import {
  ApplicationUserConsentOrganizationScopes,
  ApplicationUserConsentResourceScopes,
  ApplicationUserConsentUserScopes,
  Applications,
  OrganizationScopes,
  Scopes,
} from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { sql, type CommonQueryMethods } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { TwoRelationsQueries } from '#src/utils/RelationQueries.js';

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

  return {
    insert,
    findAllByApplicationId,
  };
};
