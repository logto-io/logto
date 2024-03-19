import { type CreateDomain, type Domain, DomainStatus, Domains } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers, manyRows, type OmitAutoSetFields } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Domains);

export const createDomainsQueries = (pool: CommonQueryMethods) => {
  const findAllDomains = async () =>
    manyRows(
      pool.query<Domain>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
      `)
    );

  const findDomainById = buildFindEntityByIdWithPool(pool)(Domains);

  const findActiveDomain = async (domain: string) =>
    pool.maybeOne<Domain>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.domain}=${domain}
        and ${fields.status}=${DomainStatus.Active}
    `);

  const insertDomain = buildInsertIntoWithPool(pool)(Domains, {
    returning: true,
  });

  const updateDomain = buildUpdateWhereWithPool(pool)(Domains, true);

  const updateDomainById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateDomain>>,
    jsonbMode: 'replace' | 'merge' = 'replace'
  ) => updateDomain({ set, where: { id }, jsonbMode });

  const deleteDomainById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Domains.table, id);
    }
  };

  return {
    findAllDomains,
    findDomainById,
    findActiveDomain,
    insertDomain,
    updateDomainById,
    deleteDomainById,
  };
};
