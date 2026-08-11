import type { CreateSignInExperience } from '@logto/schemas';
import { SignInExperiences } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { EnvSet } from '#src/env-set/index.js';

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

  /**
   * Effective username case-sensitivity: the per-tenant policy AND-combined with the legacy
   * `CASE_SENSITIVE_USERNAME` env var — case-insensitive if either is false.
   * See {@link EnvSet.values.isCaseSensitiveUsername}.
   */
  const getUsernameCaseSensitive = async () => {
    const { usernamePolicy } = await findDefaultSignInExperience();
    return usernamePolicy.caseSensitive && EnvSet.values.isCaseSensitiveUsername;
  };

  return {
    updateDefaultSignInExperience,
    findDefaultSignInExperience,
    getUsernameCaseSensitive,
  };
};
