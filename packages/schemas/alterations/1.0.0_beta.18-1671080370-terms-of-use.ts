import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

type DeprecatedTermsOfUse = {
  enabled: boolean;
  contentUrl?: string;
};

type DeprecatedSignInExperience = {
  id: string;
  termsOfUse: DeprecatedTermsOfUse;
};

type SignInExperience = {
  id: string;
  termsOfUseUrl?: string | null;
};

const alterTermsOfUse = async (
  signInExperience: DeprecatedSignInExperience,
  pool: DatabaseTransactionConnection
) => {
  const {
    id,
    termsOfUse: { enabled, contentUrl },
  } = signInExperience;

  if (enabled && contentUrl) {
    await pool.query(
      sql`update sign_in_experiences set terms_of_use_url = ${contentUrl} where id = ${id}`
    );
  }
};

const rollbackTermsOfUse = async (
  signInExperience: SignInExperience,
  pool: DatabaseTransactionConnection
) => {
  const { id, termsOfUseUrl } = signInExperience;

  const termsOfUse: DeprecatedTermsOfUse = {
    enabled: Boolean(termsOfUseUrl),
    contentUrl: termsOfUseUrl ?? '',
  };

  await pool.query(
    sql`update sign_in_experiences set terms_of_use = ${JSON.stringify(
      termsOfUse
    )} where id = ${id}`
  );
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const rows = await pool.many<DeprecatedSignInExperience>(
      sql`select * from sign_in_experiences`
    );

    await pool.query(sql`
      alter table sign_in_experiences add column terms_of_use_url varchar(2048)
    `);

    await Promise.all(rows.map(async (row) => alterTermsOfUse(row, pool)));

    await pool.query(sql`
      alter table sign_in_experiences drop column terms_of_use
    `);
  },
  down: async (pool) => {
    const rows = await pool.many<SignInExperience>(sql`select * from sign_in_experiences`);

    await pool.query(sql`
      alter table sign_in_experiences add column terms_of_use jsonb not null default '{}'::jsonb;
      alter table sign_in_experiences alter column terms_of_use drop default;
    `);

    await Promise.all(rows.map(async (row) => rollbackTermsOfUse(row, pool)));

    await pool.query(sql`
      alter table sign_in_experiences drop column terms_of_use_url
    `);
  },
};

export default alteration;
