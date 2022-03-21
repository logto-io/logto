import { SignInExperience, CreateSignInExperience, SignInExperiences } from '@logto/schemas';
import { sql } from 'slonik';

import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers } from '@/database/utils';

const { table, fields } = convertToIdentifiers(SignInExperiences);

const updateSignInExperience = buildUpdateWhere<CreateSignInExperience, SignInExperience>(
  pool,
  SignInExperiences,
  true
);

const id = 'default';

export const updateDefaultSignInExperience = async (set: Partial<CreateSignInExperience>) =>
  updateSignInExperience({ set, where: { id } });

export const findDefaultSignInExperience = async () =>
  pool.one<SignInExperience>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id} = ${id}
  `);
