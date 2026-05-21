import {
  Applications,
  type ApplicationSecret,
  ApplicationSecrets,
  defaultApplicationSecretName,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import RequestError from '#src/errors/RequestError/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { buildUpdateWhereWithPool } from '../database/update-where.js';

type ApplicationCredentials = ApplicationSecret & {
  /** The original application secret that stored in the `applications` table. */
  originalSecret: string;
};

const { table, fields } = convertToIdentifiers(ApplicationSecrets);

export class ApplicationSecretQueries {
  public readonly insert = buildInsertIntoWithPool(this.pool)(ApplicationSecrets, {
    returning: true,
  });

  public readonly update = buildUpdateWhereWithPool(this.pool)(ApplicationSecrets, true);

  constructor(public readonly pool: CommonQueryMethods) {}

  async findByCredentials(appId: string, appSecret: string) {
    const applications = convertToIdentifiers(Applications, true);
    const { table, fields } = convertToIdentifiers(ApplicationSecrets, true);

    return this.pool.maybeOne<ApplicationCredentials>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}, ${
        applications.fields.secret
      } as "originalSecret"
        from ${table}
        join ${applications.table} on ${fields.applicationId} = ${applications.fields.id}
        where ${fields.applicationId} = ${appId}
        and ${fields.value}=${appSecret}
    `);
  }

  async getSecretsByApplicationId(appId: string) {
    return this.pool.any<ApplicationSecret>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.applicationId} = ${appId}
    `);
  }

  async findActiveSecretByApplicationId(appId: string) {
    const activeSecret = await this.pool.maybeOne<ApplicationSecret>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.applicationId} = ${appId}
        and (${fields.expiresAt} is null or ${fields.expiresAt} > now())
        order by
          case when ${fields.name} = ${defaultApplicationSecretName} then 0 else 1 end,
          ${fields.createdAt} asc
        limit 1
    `);

    if (!activeSecret) {
      throw new RequestError({
        code: 'application.protected_application_misconfigured',
        status: 422,
      });
    }

    return activeSecret;
  }

  async deleteByName(appId: string, name: string) {
    const {
      rowCount,
      rows: [deletedSecret],
    } = await this.pool.query<ApplicationSecret>(sql`
      delete from ${table}
        where ${fields.applicationId} = ${appId}
        and ${fields.name} = ${name}
      returning ${sql.join(Object.values(fields), sql`, `)}
    `);
    if (rowCount < 1 || !deletedSecret) {
      throw new DeletionError(ApplicationSecrets.table, name);
    }

    return deletedSecret;
  }
}
