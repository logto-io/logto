import { type CaptchaProvider, ExperienceRedisCacheKey, CaptchaProviders } from '@logto/schemas';
import { type ZodType } from 'zod';

import { BaseCache } from './base-cache.js';

type SignInExperienceCacheMap = {
  [ExperienceRedisCacheKey.CaptchaProvider]: CaptchaProvider | undefined;
};

type SignInExperienceCacheType = keyof SignInExperienceCacheMap;

function getValueGuard(
  type: SignInExperienceCacheType
): ZodType<SignInExperienceCacheMap[typeof type]> {
  switch (type) {
    case ExperienceRedisCacheKey.CaptchaProvider: {
      return CaptchaProviders.guard;
    }
  }
}

/**
 * A cache for data used in sign-in experience flows.
 */
export class SignInExperienceCache extends BaseCache<SignInExperienceCacheMap> {
  name = 'Sign In Experience';
  getValueGuard = getValueGuard;
}
