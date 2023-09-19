import {
  type ActivityReport,
  Sentinel,
  SentinelDecision,
  type SentinelActivity,
  SentinelActivities,
  SentinelActionResult,
  SentinelActivityAction,
} from '@logto/schemas';
import { convertToIdentifiers, generateStandardId } from '@logto/shared';
import { cond } from '@silverhand/essentials';
import { addMinutes } from 'date-fns';
import { sql, type CommonQueryMethods } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

const { fields, table } = convertToIdentifiers(SentinelActivities);

/**
 * A basic sentinel that blocks a user after 5 failed attempts in 1 hour.
 *
 * @see {@link BasicSentinel.supportedActions} for the list of supported actions.
 */
export default class BasicSentinel extends Sentinel {
  /** The list of actions that are accepted to be reported to this sentinel. */
  static supportedActions = Object.freeze([
    SentinelActivityAction.Password,
    SentinelActivityAction.VerificationCode,
  ] as const);

  /** The array of all supported actions in SQL format. */
  static supportedActionArray = sql.array(
    BasicSentinel.supportedActions,
    SentinelActivities.fields.action
  );

  /**
   * Asserts that the given action is supported by this sentinel.
   *
   * @throws {Error} If the action is not supported.
   */
  static assertAction(action: unknown): asserts action is SentinelActivityAction {
    // eslint-disable-next-line no-restricted-syntax
    if (!BasicSentinel.supportedActions.includes(action as SentinelActivityAction)) {
      // Update to use the new error class later.
      throw new Error(`Unsupported action: ${String(action)}`);
    }
  }

  protected insertActivity = buildInsertIntoWithPool(this.pool)(SentinelActivities);

  constructor(protected readonly pool: CommonQueryMethods) {
    super();
  }

  /**
   * Reports an activity to this sentinel. The sentinel will decide whether to block the user or
   * not.
   *
   * Regardless of the decision, the activity will be recorded in the database.
   *
   * @param activity The activity to report.
   * @returns The decision made by the sentinel.
   * @throws {Error} If the action is not supported.
   * @see {@link BasicSentinel.supportedActions} for the list of supported actions.
   */
  async reportActivity(activity: ActivityReport): Promise<SentinelDecision> {
    BasicSentinel.assertAction(activity.action);

    const decision = await this.decide(activity);

    await this.insertActivity({
      id: generateStandardId(),
      ...activity,
      decision,
      decisionExpiresAt: cond(
        decision === SentinelDecision.Blocked && addMinutes(new Date(), 10).valueOf()
      ),
    });

    return decision;
  }

  /**
   * Checks whether the given target is blocked from performing actions.
   *
   * @remarks
   * All supported actions share the same pool of activities, i.e. once a user has failed to
   * perform any of the supported actions for certain times, the user will be blocked from
   * performing any of the supported actions.
   */
  protected async isBlocked(
    query: Pick<SentinelActivity, 'targetType' | 'targetHash'>
  ): Promise<boolean> {
    const blocked = await this.pool.maybeOne(sql`
      select ${fields.id} from ${table}
      where ${fields.targetType} = ${query.targetType}
        and ${fields.targetHash} = ${query.targetHash}
        and ${fields.action} = any(${BasicSentinel.supportedActionArray})
        and ${fields.decision} = ${SentinelDecision.Blocked}
        and ${fields.decisionExpiresAt} > now()
      limit 1
    `);
    return Boolean(blocked);
  }

  protected async decide(
    query: Pick<SentinelActivity, 'targetType' | 'targetHash' | 'actionResult'>
  ): Promise<SentinelDecision> {
    const blocked = await this.isBlocked(query);

    if (blocked) {
      return SentinelDecision.Blocked;
    }

    const failedAttempts = await this.pool.oneFirst<number>(sql`
      select count(*) from ${table}
      where ${fields.targetType} = ${query.targetType}
        and ${fields.targetHash} = ${query.targetHash}
        and ${fields.action} = any(${BasicSentinel.supportedActionArray})
        and ${fields.actionResult} = ${SentinelActionResult.Failed}
        and ${fields.decision} != ${SentinelDecision.Blocked}
        and ${fields.createdAt} > now() - interval '1 hour'
    `);

    return failedAttempts + (query.actionResult === SentinelActionResult.Failed ? 1 : 0) >= 5
      ? SentinelDecision.Blocked
      : SentinelDecision.Allowed;
  }
}
