import { sql } from 'slonik';

import type { AlterationScript } from '../src/types/alteration';

type SignInExperience = {
  termsOfUse: {
    enabled: boolean;
    contentUrl?: string;
  };
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const id = 'default';

    await pool.query(sql`
      alter table sign_in_experiences add column terms_of_use_url varchar(2048)
    `);

    const data = await pool.maybeOne<SignInExperience>(
      sql`select * from sign_in_experiences where id = ${id}`
    );

    if (data) {
      const {
        termsOfUse: { enabled, contentUrl },
      } = data;

      if (enabled && contentUrl) {
        await pool.query(sql`
          update sign_in_experiences set terms_of_use_url = ${contentUrl} where id = ${id}
        `);
      }
    }
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences drop column terms_of_use_url
    `);
  },
};

export default alteration;
