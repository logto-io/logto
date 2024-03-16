import type { CreateSignInExperience } from '@logto/schemas';
import { SignInExperiences } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';

const id = 'default';

export const createSignInExperienceQueries = (
  pool: CommonQueryMethods,
  wellKnownCache: WellKnownCache
) => {
  const updateSignInExperience = buildUpdateWhereWithPool(pool)(SignInExperiences, true);
  const findSignInExperienceById = buildFindEntityByIdWithPool(pool)(SignInExperiences);

  const updateDefaultSignInExperience = wellKnownCache.mutate(
    async (set: Partial<CreateSignInExperience>) =>
      updateSignInExperience({ set, where: { id }, jsonbMode: 'replace' }),
    ['sie']
  );

  const findDefaultSignInExperience = wellKnownCache.memoize(
    async () => findSignInExperienceById(id),
    ['sie']
  );

  return {
    updateDefaultSignInExperience,
    findDefaultSignInExperience,
  };
};
