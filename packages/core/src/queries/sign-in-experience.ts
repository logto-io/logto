import type { SignInExperience, CreateSignInExperience } from '@logto/schemas';
import { SignInExperiences } from '@logto/schemas';
import type { CommonQueryMethods } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';

const id = 'default';

export const createSignInExperienceQueries = (pool: CommonQueryMethods) => {
  const updateSignInExperience = buildUpdateWhereWithPool(pool)<
    CreateSignInExperience,
    SignInExperience
  >(SignInExperiences, true);

  const updateDefaultSignInExperience = async (set: Partial<CreateSignInExperience>) =>
    updateSignInExperience({ set, where: { id }, jsonbMode: 'replace' });

  const findDefaultSignInExperience = async () =>
    buildFindEntityByIdWithPool(pool)<CreateSignInExperience, SignInExperience>(SignInExperiences)(
      id
    );

  return { updateDefaultSignInExperience, findDefaultSignInExperience };
};
