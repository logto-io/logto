import { OidcSessionExtensions } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '../database/insert-into.js';
import { convertToIdentifiers } from '../utils/sql.js';

const { table, fields } = convertToIdentifiers(OidcSessionExtensions);

export class OidcSessionExtensionsQueries {
  public readonly insert = buildInsertIntoWithPool(this.pool)(OidcSessionExtensions, {
    onConflict: {
      fields: [fields.tenantId, fields.sessionUid],
      setExcludedFields: [fields.lastSubmission, fields.updatedAt, fields.accountId],
    },
    returning: true,
  });

  constructor(public readonly pool: CommonQueryMethods) {}

  async deleteBySessionUid(sessionUid: string) {
    await this.pool.query(sql`
      delete from ${table}
        where ${fields.sessionUid} = ${sessionUid}
    `);
  }

  async deleteByAccountId(accountId: string) {
    await this.pool.query(sql`
      delete from ${table}
        where ${fields.accountId} = ${accountId}
    `);
  }
}
