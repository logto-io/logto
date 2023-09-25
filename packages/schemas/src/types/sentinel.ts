import { type SentinelDecision, type SentinelActivity } from '../db-entries/index.js';

/** The activity payload to be sent to the sentinel. */
export type ActivityReport = Pick<
  SentinelActivity,
  'targetType' | 'targetHash' | 'action' | 'actionResult' | 'payload'
>;

/** The sentinel decision with its expiration. */
export type SentinelDecisionTuple = [decision: SentinelDecision, decisionExpiresAt: number];

/**
 * The sentinel class interface.
 *
 * Sentinels are responsible for accepting activity reports and making decisions based on them.
 *
 * For example, for a user sign-in activity, the sentinel might decide to:
 *
 * - Accept since the user uses the same device and location as usual;
 * - Require a MFA code since the user uses a new device or location;
 * - Block the user since the user tried to sign-in too many times with an incorrect password.
 *
 * The implementation should be privacy-aware and not store any personal identifiable information.
 */
export abstract class Sentinel {
  /**
   * Report an activity to the sentinel. The sentinel should make a decision based on the activity
   * (also the history, if needed) and return the result.
   *
   * @param activity The activity data to be reported.
   * @returns A Promise that resolves to the sentinel decision.
   * @see {@link SentinelDecision}
   */
  abstract reportActivity(activity: ActivityReport): Promise<Readonly<SentinelDecisionTuple>>;
}
