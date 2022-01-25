import { SignInExperience, CreateSignInExperience, SignInExperiences } from '@logto/schemas';
import { sql } from 'slonik';

import { buildFindMany } from '@/database/find-many';
import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, getTotalRowCount } from '@/database/utils';

const { table, fields } = convertToIdentifiers(SignInExperiences);

export const findTotalNumberOfSignInExperiences = async () => getTotalRowCount(table);

const findSignInExperiencesMany = buildFindMany<CreateSignInExperience, SignInExperience>(
  pool,
  SignInExperiences
);

export const findAllSignInExperiences = async (limit: number, offset: number) =>
  findSignInExperiencesMany({ limit, offset });

export const findSignInExperienceById = async (id: string) =>
  pool.one<SignInExperience>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const insertSignInExperience = buildInsertInto<CreateSignInExperience, SignInExperience>(
  pool,
  SignInExperiences,
  {
    returning: true,
  }
);

const updateSignInExperience = buildUpdateWhere<CreateSignInExperience, SignInExperience>(
  pool,
  SignInExperiences,
  true
);

export const updateSignInExperienceById = async (
  id: string,
  set: Partial<CreateSignInExperience>
) => updateSignInExperience({ set, where: { id } });

export const findDefaultSignInExperience = async () =>
  pool.one<SignInExperience>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}='default'
  `);
