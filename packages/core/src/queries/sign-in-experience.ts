import type { CreateSignInExperience, SignInExperience } from '@logto/schemas';
import { SignInExperiences, mfaGuard, normalizeMfa } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';

const id = 'default';

const normalizeMfaField = (mfa: SignInExperience['mfa'] | string) => {
  if (typeof mfa === 'string') {
    return JSON.stringify(normalizeMfa(mfaGuard.parse(JSON.parse(mfa))));
  }

  return normalizeMfa(mfa);
};

const normalizeSignInExperience = <T extends { mfa: SignInExperience['mfa'] | string }>(
  data: T
): T => ({
  ...data,
  mfa: normalizeMfaField(data.mfa),
});

export const createSignInExperienceQueries = (
  pool: CommonQueryMethods,
  wellKnownCache: WellKnownCache
) => {
  const updateSignInExperience = buildUpdateWhereWithPool(pool)(SignInExperiences, true);
  const findSignInExperienceById = buildFindEntityByIdWithPool(pool)(SignInExperiences);

  const updateDefaultSignInExperience = wellKnownCache.mutate(
    async (set: Partial<CreateSignInExperience>) =>
      normalizeSignInExperience(
        await updateSignInExperience({ set, where: { id }, jsonbMode: 'replace' })
      ),
    ['sie']
  );

  const findDefaultSignInExperience = wellKnownCache.memoize(
    async () => normalizeSignInExperience(await findSignInExperienceById(id)),
    ['sie']
  );

  return {
    updateDefaultSignInExperience,
    findDefaultSignInExperience,
  };
};
