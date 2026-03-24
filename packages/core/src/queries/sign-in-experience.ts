import type { CreateSignInExperience, SignInExperience } from '@logto/schemas';
import { SignInExperiences, mfaGuard } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { EnvSet } from '#src/env-set/index.js';
import {
  legacyizeRequiredMfaPolicy,
  normalizeRequiredMfaPolicy,
} from '#src/libraries/sign-in-experience/mfa-policy.js';

const id = 'default';

const transformMfaByDevFeatures = (mfa: SignInExperience['mfa']) => ({
  ...mfa,
  policy: EnvSet.values.isDevFeaturesEnabled
    ? normalizeRequiredMfaPolicy(mfa.policy)
    : legacyizeRequiredMfaPolicy(mfa.policy),
});

const normalizeMfaField = (mfa: SignInExperience['mfa'] | string) => {
  const parsedMfa = typeof mfa === 'string' ? mfaGuard.parse(JSON.parse(mfa)) : mfa;
  const transformedMfa = transformMfaByDevFeatures(parsedMfa);

  if (typeof mfa === 'string') {
    return JSON.stringify(transformedMfa);
  }

  return transformedMfa;
};

const normalizeSignInExperience = <
  T extends {
    mfa: SignInExperience['mfa'] | string;
    adaptiveMfa: SignInExperience['adaptiveMfa'] | string;
  },
>(
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
