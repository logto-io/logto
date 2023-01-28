import type { CreateCustomPhrase, CustomPhrase } from '@logto/schemas';
import { CustomPhrases } from '@logto/schemas';
import { convertToIdentifiers, manyRows } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(CustomPhrases);

export const createCustomPhraseQueries = (pool: CommonQueryMethods) => {
  const findAllCustomLanguageTags = async () => {
    const rows = await manyRows<{ languageTag: string }>(
      pool.query(sql`
        select ${fields.languageTag}
        from ${table}
        order by ${fields.languageTag}
      `)
    );

    return rows.map((row) => row.languageTag);
  };

  const findAllCustomPhrases = async () =>
    manyRows(
      pool.query<CustomPhrase>(sql`
        select ${sql.join(Object.values(fields), sql`,`)}
        from ${table}
        order by ${fields.languageTag}
      `)
    );

  const findCustomPhraseByLanguageTag = async (languageTag: string): Promise<CustomPhrase> =>
    pool.one<CustomPhrase>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.languageTag} = ${languageTag}
    `);

  const upsertCustomPhrase = buildInsertIntoWithPool(pool)<CreateCustomPhrase, CustomPhrase>(
    CustomPhrases,
    {
      returning: true,
      onConflict: {
        fields: [fields.tenantId, fields.languageTag],
        setExcludedFields: [fields.translation],
      },
    }
  );

  const deleteCustomPhraseByLanguageTag = async (languageTag: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.languageTag}=${languageTag}
    `);

    if (rowCount < 1) {
      throw new DeletionError(CustomPhrases.table, languageTag);
    }
  };

  return {
    findAllCustomLanguageTags,
    findAllCustomPhrases,
    findCustomPhraseByLanguageTag,
    upsertCustomPhrase,
    deleteCustomPhraseByLanguageTag,
  };
};
