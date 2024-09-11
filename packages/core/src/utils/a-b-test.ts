import crypto from 'node:crypto';

type Properties = {
  /**
   * The unique identifier of the A/B test.
   */
  entityId: string;
  /**
   * The percentage of users that should be included in the A/B test.
   * The value should be between 0 and 1.
   */
  rollOutPercentage: number;
};

/**
 * Check if a request is included in an A/B test.
 * We use the session ID to determine if the request should be included in the A/B test.
 */
export const isRequestInTestGroup = ({ entityId, rollOutPercentage }: Properties) => {
  const hash = crypto.createHash('md5');
  const hashedSessionId = hash.update(entityId).digest('hex');

  // Convert hash to a number between 0 and 999
  const hashValue = Number.parseInt(hashedSessionId, 16) % 1000;

  // Check if the request is eligible for the A/B test based on the rollout percentage
  return hashValue < rollOutPercentage * 1000;
};
