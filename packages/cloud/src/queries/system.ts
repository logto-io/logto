import type { System } from '@logto/schemas';
import { demoSocialDataGuard, DemoSocialKey } from '@logto/schemas';
import type { PostgreSql } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';

export type SystemsQuery = ReturnType<typeof createSystemsQuery>;

export const createSystemsQuery = (client: Queryable<PostgreSql>) => {
  const getDemoSocialValue = async () => {
    const { rows } = await client.query<System>(sql`
      select key, value
      from systems
      where key=${DemoSocialKey.DemoSocial}
    `);

    if (!rows[0]) {
      return;
    }

    const result = demoSocialDataGuard.safeParse(rows[0].value);

    if (result.success) {
      return result.data;
    }
  };

  return { getDemoSocialValue };
};
