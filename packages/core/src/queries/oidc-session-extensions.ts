import { OidcSessionExtensions, type OidcSessionExtension } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '../database/insert-into.js';
import { convertToIdentifiers } from '../utils/sql.js';

const { table, fields } = convertToIdentifiers(OidcSessionExtensions);

export class OidcSessionExtensionsQueries {
  public readonly insert = buildInsertIntoWithPool(this.pool)(OidcSessionExtensions, {
    onConflict: {
      fields: [fields.tenantId, fields.sessionUid],
      setExcludedFields: [
        fields.lastSubmission,
        fields.updatedAt,
        fields.accountId,
        fields.clientId,
      ],
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

  async findBySessionUid(sessionUid: string) {
    return this.pool.maybeOne<OidcSessionExtension>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.sessionUid} = ${sessionUid}
    `);
  }
}
