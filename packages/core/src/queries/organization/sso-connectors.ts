import {
  OrganizationJitRoles,
  OrganizationJitSsoConnectors,
  Organizations,
  SsoConnectors,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { TwoRelationsQueries } from '#src/utils/RelationQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { type JitOrganization } from './email-domains.js';

const { table, fields } = convertToIdentifiers(OrganizationJitSsoConnectors);

export class SsoConnectorQueries extends TwoRelationsQueries<
  typeof Organizations,
  typeof SsoConnectors
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationJitSsoConnectors.table, Organizations, SsoConnectors);
  }

  async getJitOrganizations(ssoConnectorId?: string): Promise<readonly JitOrganization[]> {
    if (!ssoConnectorId) {
      return [];
    }

    const { fields } = convertToIdentifiers(OrganizationJitSsoConnectors, true);
    const organizationJitRoles = convertToIdentifiers(OrganizationJitRoles, true);
    return this.pool.any<JitOrganization>(sql`
      select
        ${fields.organizationId},
        array_remove(
          array_agg(${organizationJitRoles.fields.organizationRoleId}),
          null
        ) as "organizationRoleIds"
      from ${table}
      left join ${organizationJitRoles.table}
        on ${fields.organizationId} = ${organizationJitRoles.fields.organizationId}
      where ${fields.ssoConnectorId} = ${ssoConnectorId}
      group by ${fields.organizationId}
    `);
  }
}
