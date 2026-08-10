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
  const findSignInExperienceById = buildFindEntityByIdWithPool(pool)(SignInExperiences);

  const updateDefaultSignInExperience = async (
    set: Partial<CreateSignInExperience>,
    executor?: CommonQueryMethods
  ) => {
    const updateSignInExperience = buildUpdateWhereWithPool(executor ?? pool)(
      SignInExperiences,
      true
    );
    const update = async () => updateSignInExperience({ set, where: { id }, jsonbMode: 'replace' });

    return executor ? update() : wellKnownCache.mutate(update, ['sie'])();
  };

  const findDefaultSignInExperienceWithCache = wellKnownCache.memoize(
    async () => findSignInExperienceById(id),
    ['sie']
  );

  const findDefaultSignInExperience = async (executor?: CommonQueryMethods) =>
    executor
      ? buildFindEntityByIdWithPool(executor)(SignInExperiences)(id)
      : findDefaultSignInExperienceWithCache();

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
