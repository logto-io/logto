import type { CreateCustomPhrase, CustomPhrase } from '@logto/schemas';
import { CustomPhrases } from '@logto/schemas';
import { convertToIdentifiers, manyRows } from '@logto/shared';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(CustomPhrases);

export const findAllCustomLanguageTags = async () => {
  const rows = await manyRows<{ languageTag: string }>(
    envSet.pool.query(sql`
      select ${fields.languageTag}
      from ${table}
      order by ${fields.languageTag}
    `)
  );

  return rows.map((row) => row.languageTag);
};

export const findAllCustomPhrases = async () =>
  manyRows(
    envSet.pool.query<CustomPhrase>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      order by ${fields.languageTag}
    `)
  );

export const findCustomPhraseByLanguageTag = async (languageTag: string): Promise<CustomPhrase> =>
  envSet.pool.one<CustomPhrase>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.languageTag} = ${languageTag}
  `);

export const upsertCustomPhrase = buildInsertInto<CreateCustomPhrase, CustomPhrase>(CustomPhrases, {
  returning: true,
  onConflict: {
    fields: [fields.languageTag],
    setExcludedFields: [fields.translation],
  },
});

export const deleteCustomPhraseByLanguageTag = async (languageTag: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.languageTag}=${languageTag}
  `);

  if (rowCount < 1) {
    throw new DeletionError(CustomPhrases.table, languageTag);
  }
};
