import crypto from 'node:crypto';

type Properties = {
  /**
   * The unique identifier of the feature flag entity.
   */
  entityId: string;
  /**
   * The percentage of requests that should be have the feature flag enabled.
   * The value should be between 0 and 1.
   */
  rollOutPercentage: number;
};

/**
 * Check if the feature is enabled for the given entity.
 *
 * The function uses a simple hashing algorithm to determine
 * if the feature is enabled for the given entityId based on a
 * given rollOutPercentage.
 */
export const isFeatureEnabledForEntity = ({ entityId, rollOutPercentage }: Properties) => {
  const hash = crypto.createHash('sha256');
  const hashedSessionId = hash.update(entityId).digest('hex');

  // Convert hash to a number between 0 and 999
  const hashValue = Number.parseInt(hashedSessionId, 16) % 1000;

  // Check if the request is eligible for the A/B test based on the rollout percentage
  return hashValue < rollOutPercentage * 1000;
};
