import { CustomPhrase, CustomPhrases } from '@logto/schemas';
import { sql } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(CustomPhrases);

export const findCustomPhraseByLanguageKey = async (languageKey: string): Promise<CustomPhrase> =>
  envSet.pool.one<CustomPhrase>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.languageKey} = ${languageKey}
  `);

export const deleteCustomPhraseByLanguageKey = async (languageKey: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.languageKey}=${languageKey}
  `);

  if (rowCount < 1) {
    throw new DeletionError(CustomPhrases.table, languageKey);
  }
};
