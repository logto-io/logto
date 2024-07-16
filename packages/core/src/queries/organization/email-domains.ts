import {
  type OrganizationJitEmailDomain,
  OrganizationJitEmailDomains,
  type CreateOrganizationJitEmailDomain,
  OrganizationJitRoles,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { type GetEntitiesOptions } from '#src/utils/RelationQueries.js';
import { type OmitAutoSetFields, conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(OrganizationJitEmailDomains);

export class EmailDomainQueries {
  readonly #insert: (
    data: OmitAutoSetFields<CreateOrganizationJitEmailDomain>
  ) => Promise<Readonly<OrganizationJitEmailDomain>>;

  constructor(protected pool: CommonQueryMethods) {
    this.#insert = buildInsertIntoWithPool(this.pool)(OrganizationJitEmailDomains, {
      returning: true,
    });
  }

  async getEntities(
    organizationId: string,
    options: GetEntitiesOptions
  ): Promise<[number, readonly OrganizationJitEmailDomain[]]> {
    const { limit, offset } = options;
    const mainSql = sql`
      from ${table}
      where ${fields.organizationId} = ${organizationId}
    `;

    const [{ count }, rows] = await Promise.all([
      this.pool.one<{ count: string }>(sql`
        select count(*)
        ${mainSql}
      `),
      this.pool.any<OrganizationJitEmailDomain>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        ${mainSql}
        ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
        ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
      `),
    ]);

    return [Number(count), rows];
  }

  /**
   * Given an email domain, return the organizations and organization roles that need to be
   * provisioned.
   */
  async getJitOrganizations(emailDomain?: string): Promise<readonly JitOrganization[]> {
    if (!emailDomain) {
      return [];
    }

    const { fields } = convertToIdentifiers(OrganizationJitEmailDomains, true);
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
      where ${fields.emailDomain} = ${emailDomain}
      group by ${fields.organizationId}
    `);
  }

  async insert(organizationId: string, emailDomain: string): Promise<OrganizationJitEmailDomain> {
    return this.#insert({
      organizationId,
      emailDomain,
    });
  }

  async delete(organizationId: string, emailDomain: string): Promise<void> {
    const { rowCount } = await this.pool.query(sql`
      delete from ${table}
      where ${fields.organizationId} = ${organizationId}
      and ${fields.emailDomain} = ${emailDomain}
    `);

    if (rowCount < 1) {
      throw new DeletionError(OrganizationJitEmailDomains.table);
    }
  }

  async replace(organizationId: string, emailDomains: readonly string[]): Promise<void> {
    return this.pool.transaction(async (transaction) => {
      // Lock organization
      await transaction.query(sql`
        select ${fields.organizationId}
        from ${table}
        where ${fields.organizationId} = ${organizationId}
        for update
      `);

      // Delete old email domains
      await transaction.query(sql`
        delete from ${table}
        where ${fields.organizationId} = ${organizationId}
      `);

      // Insert new email domains
      if (emailDomains.length === 0) {
        return;
      }

      await transaction.query(sql`
        insert into ${table} (
          ${fields.organizationId},
          ${fields.emailDomain}
        )
        values ${sql.join(
          emailDomains.map((emailDomain) => sql`(${organizationId}, ${emailDomain})`),
          sql`, `
        )}
      `);
    });
  }
}

export type JitOrganization = {
  organizationId: string;
  organizationRoleIds: string[];
};
