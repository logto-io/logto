import { type PersonalAccessToken, PersonalAccessTokens } from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { buildUpdateWhereWithPool } from '../database/update-where.js';

const { table, fields } = convertToIdentifiers(PersonalAccessTokens);

export class PersonalAccessTokensQueries {
  public readonly insert = buildInsertIntoWithPool(this.pool)(PersonalAccessTokens, {
    returning: true,
  });

  private readonly update = buildUpdateWhereWithPool(this.pool)(PersonalAccessTokens, true);

  constructor(public readonly pool: CommonQueryMethods) {}

  public readonly findByValue = async (value: string) => {
    return this.pool.maybeOne<PersonalAccessToken>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.value} = ${value}
    `);
  };

  async updateName(userId: string, name: string, newName: string) {
    return this.update({
      where: { userId, name },
      set: { name: newName },
      jsonbMode: 'replace',
    });
  }

  async getTokensByUserId(userId: string) {
    return this.pool.any<PersonalAccessToken>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.userId} = ${userId}
    `);
  }

  async deleteByName(appId: string, name: string) {
    const { rowCount } = await this.pool.query(sql`
      delete from ${table}
        where ${fields.userId} = ${appId}
        and ${fields.name} = ${name}
    `);
    if (rowCount < 1) {
      throw new DeletionError(PersonalAccessTokens.table, name);
    }
  }
}
