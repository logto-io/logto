import { CustomPhrase, CustomPhrases } from '@logto/schemas';
import { sql } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(CustomPhrases);

export const findCustomPhraseByLanguageKey = async (languageKey: string): Promise<CustomPhrase> =>
  envSet.pool.one<CustomPhrase>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.languageKey} = ${languageKey}
  `);
