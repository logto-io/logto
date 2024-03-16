import type { CustomPhrase, Translation } from '@logto/schemas';
import { CustomPhrases } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers, manyRows } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(CustomPhrases);

export const createCustomPhraseQueries = (
  pool: CommonQueryMethods,
  wellKnownCache: WellKnownCache
) => {
  const findAllCustomLanguageTags = wellKnownCache.memoize(async () => {
    const rows = await manyRows<{ languageTag: string }>(
      pool.query(sql`
        select ${fields.languageTag}
        from ${table}
        order by ${fields.languageTag}
      `)
    );

    return rows.map((row) => row.languageTag);
  }, ['custom-phrases-tags']);

  const findAllCustomPhrases = async () =>
    manyRows(
      pool.query<CustomPhrase>(sql`
        select ${sql.join(Object.values(fields), sql`,`)}
        from ${table}
        order by ${fields.languageTag}
      `)
    );

  const findCustomPhraseByLanguageTag = wellKnownCache.memoize(
    async (languageTag: string): Promise<CustomPhrase> =>
      pool.one<CustomPhrase>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.languageTag} = ${languageTag}
      `),
    ['custom-phrases', (languageTag) => languageTag]
  );

  const _upsertCustomPhrase = buildInsertIntoWithPool(pool)(CustomPhrases, {
    returning: true,
    onConflict: {
      fields: [fields.tenantId, fields.languageTag],
      setExcludedFields: [fields.translation],
    },
  });

  const upsertCustomPhrase = wellKnownCache.mutate(
    async (languageTag: string, translation: Translation) =>
      // LOG-5915 Remove `id` in custom phrases
      _upsertCustomPhrase({ id: generateStandardId(), languageTag, translation }),
    ['custom-phrases', (languageTag) => languageTag],
    ['custom-phrases-tags'] // Invalidate tags cache as well since it may add a new language tag
  );

  const deleteCustomPhraseByLanguageTag = wellKnownCache.mutate(
    async (languageTag: string) => {
      const { rowCount } = await pool.query(sql`
        delete from ${table}
        where ${fields.languageTag}=${languageTag}
      `);

      if (rowCount < 1) {
        throw new DeletionError(CustomPhrases.table, languageTag);
      }
    },
    ['custom-phrases', (languageTag) => languageTag],
    ['custom-phrases-tags']
  );

  return {
    findAllCustomLanguageTags,
    findAllCustomPhrases,
    findCustomPhraseByLanguageTag,
    upsertCustomPhrase,
    deleteCustomPhraseByLanguageTag,
  };
};
