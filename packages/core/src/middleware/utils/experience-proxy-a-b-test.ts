/**
 * This file provides the utility functions for the experience app A/B testing only.
 * Should clean up this file once the A/B testing is removed.
 */

import { abTestConfigDataGuard, ABTestConfigKey } from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import type { Context } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import { createSystemsQuery } from '#src/queries/system.js';
import { isRequestInTestGroup } from '#src/utils/a-b-test.js';

const interactionCookieName = '_interaction';

const aBTestPercentageCache = new TtlCache<string, number>(60 * 60 * 1000); // 1 hour

/**
 * Get the A/B test percentage from the system settings.
 *
 * - return the cached percentage if it exists.
 * - read the percentage from the system settings if no cache exists.
 * - return 0% if the system settings are not found.
 */
const getABTestPercentage = async () => {
  const cachedPercentage = aBTestPercentageCache.get(ABTestConfigKey.ExperiencePackageABTest);

  if (cachedPercentage !== undefined) {
    return cachedPercentage;
  }

  const sharedAdminPool = await EnvSet.sharedPool;
  const { findSystemByKey } = createSystemsQuery(sharedAdminPool);
  const abTestConfig = await findSystemByKey(ABTestConfigKey.ExperiencePackageABTest);

  const result = abTestConfigDataGuard.safeParse(abTestConfig?.value);

  if (result.success) {
    const { percentage } = result.data;
    aBTestPercentageCache.set(ABTestConfigKey.ExperiencePackageABTest, percentage);
    return percentage;
  }

  // Default to 0% if the system settings are not found
  aBTestPercentageCache.set(ABTestConfigKey.ExperiencePackageABTest, 0);
  return 0;
};

/**
 * We will roll out the new experience based on the session ID.
 *
 * - Always return the new experience package if dev features are enabled.
 * - Always return the legacy experience package for OSS. Until the new experience is fully rolled out.
 * - Roll out the new experience package based on the session ID for cloud.
 * - The A/B test percentage is read from DB system settings.
 */
export const getExperiencePackageWithABTest = async <ContextT extends Context>(ctx: ContextT) => {
  if (EnvSet.values.isDevFeaturesEnabled) {
    return 'experience';
  }

  // Always use the legacy experience package if not in the cloud, until the new experience is fully rolled out
  if (!EnvSet.values.isCloud) {
    return 'experience-legacy';
  }

  const interactionSessionId = ctx.cookies.get(interactionCookieName);

  // No session ID found, fall back to the legacy experience
  if (!interactionSessionId) {
    return 'experience-legacy';
  }

  const rollOutPercentage = await getABTestPercentage();

  const isEligibleForNewExperience = isRequestInTestGroup({
    entityId: interactionSessionId,
    rollOutPercentage,
  });

  return isEligibleForNewExperience ? 'experience' : 'experience-legacy';
};
