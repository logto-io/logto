import { type VerificationRecord, VerificationRecords } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { buildFindEntityByIdWithPool } from '../database/find-entity-by-id.js';
import { buildUpdateWhereWithPool } from '../database/update-where.js';

const { table, fields } = convertToIdentifiers(VerificationRecords);

/**
 * The lifetime of a legacy verification record: 10 minutes, intentionally independent of the
 * Account Center recent-authentication window. The window governs how recent an OIDC authentication
 * must be for the Account API, while this record is a proof a client created through the
 * Verification API, and direct Account API integrations rely on this released window.
 *
 * TODO: Remove this after we implement "Account Center" configuration
 */
export const expirationTime = 1000 * 60 * 10;

export class VerificationRecordQueries {
  public readonly insert = buildInsertIntoWithPool(this.pool)(VerificationRecords, {
    returning: true,
  });

  public readonly update = buildUpdateWhereWithPool(this.pool)(VerificationRecords, true);

  public readonly find = buildFindEntityByIdWithPool(this.pool)(VerificationRecords);

  constructor(public readonly pool: CommonQueryMethods) {}

  public findActiveVerificationRecordById = async (id: string) => {
    return this.pool.maybeOne<VerificationRecord>(sql`
      select * from ${table}
      where ${fields.id} = ${id}
      and ${fields.expiresAt} > now()
    `);
  };
}
