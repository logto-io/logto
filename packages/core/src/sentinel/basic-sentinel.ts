import {
  type ActivityReport,
  Sentinel,
  SentinelDecision,
  type SentinelDecisionTuple,
  type SentinelActivity,
  SentinelActivities,
  SentinelActionResult,
  SentinelActivityAction,
  defaultSentinelPolicy,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { type Nullable } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';
import { addMinutes } from 'date-fns';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import type Queries from '#src/tenants/Queries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { fields, table } = convertToIdentifiers(SentinelActivities);

/**
 * A basic sentinel that blocks a user after 5 failed attempts in 1 hour.
 *
 * @see {@link BasicSentinel.supportedActions} for the list of supported actions.
 */
export default class BasicSentinel extends Sentinel {
  /** The list of actions that are accepted to be reported to this sentinel. */
  static pooledActions = Object.freeze([
    SentinelActivityAction.Password,
    SentinelActivityAction.VerificationCode,
    SentinelActivityAction.OneTimeToken,
  ] as const);

  static isolatedActions = Object.freeze([
    SentinelActivityAction.MfaTotp,
    SentinelActivityAction.MfaWebAuthn,
    SentinelActivityAction.MfaBackupCode,
  ] as const);

  static supportedActions = Object.freeze([
    ...BasicSentinel.pooledActions,
    ...BasicSentinel.isolatedActions,
  ] as const);

  /** The array of pooled actions in SQL format. */
  static pooledActionArray = sql.array(BasicSentinel.pooledActions, 'varchar');

  static pooledActionSet = new Set<SentinelActivityAction>(BasicSentinel.pooledActions);

  /** The arrays of isolated actions in SQL format. */
  static isolatedActionArrays = new Map<SentinelActivityAction, ReturnType<typeof sql.array>>(
    BasicSentinel.isolatedActions.map((action) => [action, sql.array([action], 'varchar')])
  );

  static getActionArray(action: SentinelActivityAction) {
    const isPooledAction = BasicSentinel.pooledActionSet.has(action);

    if (isPooledAction) {
      return BasicSentinel.pooledActionArray;
    }

    return BasicSentinel.isolatedActionArrays.get(action) ?? sql.array([action], 'varchar');
  }

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
   * @param {Queries} queries Tenant-level queries.
   */
  constructor(
    protected readonly pool: CommonQueryMethods,
    protected readonly queries: Queries
  ) {
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
   * The password/verification-code/one-time-token actions share the same pool of activities.
   * Each MFA action uses its own pool and is blocked independently from the other actions.
   * This avoids cross-stage lockouts (e.g. repeated MFA failures preventing password or
   * verification-code sign-in) and cross-factor lockouts (e.g. WebAuthn lockouts blocking TOTP).
   */
  protected async isBlocked(
    query: Pick<SentinelActivity, 'targetType' | 'targetHash' | 'action'>
  ): Promise<Nullable<SentinelDecisionTuple>> {
    const actionArray = BasicSentinel.getActionArray(query.action);
    const blocked = await this.pool.maybeOne<Pick<SentinelActivity, 'decisionExpiresAt'>>(sql`
      select ${fields.decisionExpiresAt} from ${table}
      where ${fields.targetType} = ${query.targetType}
        and ${fields.targetHash} = ${query.targetHash}
        and ${fields.action} = any(${actionArray})
        and ${fields.decision} = ${SentinelDecision.Blocked}
        and ${fields.decisionExpiresAt} > now()
      limit 1
    `);

    return blocked && [SentinelDecision.Blocked, blocked.decisionExpiresAt];
  }

  protected async getSentinelPolicy() {
    const {
      signInExperiences: { findDefaultSignInExperience },
    } = this.queries;

    const { sentinelPolicy } = await findDefaultSignInExperience();

    return {
      ...defaultSentinelPolicy,
      ...sentinelPolicy,
    };
  }

  protected async decide(
    query: Pick<SentinelActivity, 'targetType' | 'targetHash' | 'action' | 'actionResult'>
  ): Promise<SentinelDecisionTuple> {
    const blocked = await this.isBlocked(query);

    if (blocked) {
      return blocked;
    }

    const actionArray = BasicSentinel.getActionArray(query.action);
    const failedAttempts = await this.pool.oneFirst<number>(sql`
      select count(*) from ${table}
      where ${fields.targetType} = ${query.targetType}
        and ${fields.targetHash} = ${query.targetHash}
        and ${fields.action} = any(${actionArray})
        and ${fields.actionResult} = ${SentinelActionResult.Failed}
        and ${fields.decision} != ${SentinelDecision.Blocked}
        and ${fields.createdAt} > now() - interval '1 hour'
    `);

    const { maxAttempts, lockoutDuration } = await this.getSentinelPolicy();

    const now = new Date();

    return failedAttempts + (query.actionResult === SentinelActionResult.Failed ? 1 : 0) >=
      maxAttempts
      ? [SentinelDecision.Blocked, addMinutes(now, lockoutDuration).valueOf()]
      : [SentinelDecision.Allowed, now.valueOf()];
  }
}
