import type { CreateDomain, Domain } from '@logto/schemas';
import { Domains } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { convertToIdentifiers, manyRows } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

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
    insertDomain,
    updateDomainById,
    deleteDomainById,
  };
};
