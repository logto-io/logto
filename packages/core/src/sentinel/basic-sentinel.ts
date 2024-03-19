import {
  type ActivityReport,
  Sentinel,
  SentinelDecision,
  type SentinelDecisionTuple,
  type SentinelActivity,
  SentinelActivities,
  SentinelActionResult,
  SentinelActivityAction,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { type Nullable } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';
import { addMinutes } from 'date-fns';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

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
  static supportedActionArray = sql.array(BasicSentinel.supportedActions, 'varchar');

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

  /**
   * Init a basic sentinel with the given pool that has at least the access to the tenant-level
   * data. We don't directly put the queries in the `TenantContext` because the sentinel was
   * designed to be used as an isolated module that can be separated from the core business logic.
   *
   * @param pool A database pool with methods {@link CommonQueryMethods}.
   */
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
  async reportActivity(activity: ActivityReport): Promise<SentinelDecisionTuple> {
    BasicSentinel.assertAction(activity.action);

    const [decision, decisionExpiresAt] = await this.decide(activity);

    await this.insertActivity({
      id: generateStandardId(),
      ...activity,
      decision,
      decisionExpiresAt,
    });

    return [decision, decisionExpiresAt];
  }

  /**
   * Checks whether the given target is blocked from performing actions.
   *
   * @returns The decision made by the sentinel, or `null` if the target is not blocked.
   *
   * @remarks
   * All supported actions share the same pool of activities, i.e. once a user has failed to
   * perform any of the supported actions for certain times, the user will be blocked from
   * performing any of the supported actions.
   */
  protected async isBlocked(
    query: Pick<SentinelActivity, 'targetType' | 'targetHash'>
  ): Promise<Nullable<SentinelDecisionTuple>> {
    const blocked = await this.pool.maybeOne<Pick<SentinelActivity, 'decisionExpiresAt'>>(sql`
      select ${fields.decisionExpiresAt} from ${table}
      where ${fields.targetType} = ${query.targetType}
        and ${fields.targetHash} = ${query.targetHash}
        and ${fields.action} = any(${BasicSentinel.supportedActionArray})
        and ${fields.decision} = ${SentinelDecision.Blocked}
        and ${fields.decisionExpiresAt} > now()
      limit 1
    `);
    return blocked && [SentinelDecision.Blocked, blocked.decisionExpiresAt];
  }

  protected async decide(
    query: Pick<SentinelActivity, 'targetType' | 'targetHash' | 'actionResult'>
  ): Promise<SentinelDecisionTuple> {
    const blocked = await this.isBlocked(query);

    if (blocked) {
      return blocked;
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
    const now = new Date();

    return failedAttempts + (query.actionResult === SentinelActionResult.Failed ? 1 : 0) >= 5
      ? [SentinelDecision.Blocked, addMinutes(now, 10).valueOf()]
      : [SentinelDecision.Allowed, now.valueOf()];
  }
}
