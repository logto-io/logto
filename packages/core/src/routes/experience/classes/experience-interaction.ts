import { InteractionEvent, type VerificationType } from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import type { Interaction } from '../types.js';

import {
  buildVerificationRecord,
  verificationRecordDataGuard,
  type VerificationRecord,
} from './verifications/index.js';

const interactionStorageGuard = z.object({
  event: z.nativeEnum(InteractionEvent).optional(),
  accountId: z.string().optional(),
  profile: z.object({}).optional(),
  verificationRecords: verificationRecordDataGuard.array().optional(),
});

/**
 * Interaction is a short-lived session session that is initiated when a user starts an interaction flow with the Logto platform.
 * This class is used to manage all the interaction data and status.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0004.
 */
export default class ExperienceInteraction {
  /**
   * Factory method to create a new `ExperienceInteraction` using the current context.
   */
  static async create(ctx: WithLogContext, tenant: TenantContext) {
    const { provider } = tenant;
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    return new ExperienceInteraction(ctx, tenant, interactionDetails);
  }

  /** The interaction event for the current interaction. */
  private interactionEvent?: InteractionEvent;
  /** The user verification record list for the current interaction. */
  private readonly verificationRecords: Map<VerificationType, VerificationRecord>;
  /** The accountId of the user for the current interaction. Only available once the user is identified. */
  private accountId?: string;
  /** The user provided profile data in the current interaction that needs to be stored to database. */
  private readonly profile?: Record<string, unknown>; // TODO: Fix the type

  constructor(
    private readonly ctx: WithLogContext,
    private readonly tenant: TenantContext,
    interactionDetails: Interaction
  ) {
    const { libraries, queries } = tenant;

    const result = interactionStorageGuard.safeParse(interactionDetails.result ?? {});

    assertThat(
      result.success,
      new RequestError({ code: 'session.interaction_not_found', status: 404 })
    );

    const { verificationRecords = [], profile, accountId, event } = result.data;

    this.interactionEvent = event;
    this.accountId = accountId; // TODO: @simeng-li replace with userId
    this.profile = profile;

    this.verificationRecords = new Map();

    for (const record of verificationRecords) {
      const instance = buildVerificationRecord(libraries, queries, record);
      this.verificationRecords.set(instance.type, instance);
    }
  }

  /** Set the interaction event for the current interaction */
  public setInteractionEvent(event: InteractionEvent) {
    // TODO: conflict event check (e.g. reset password session can't be used for sign in)
    this.interactionEvent = event;
  }

  /** Set the verified `accountId` of the current interaction from the verification record */
  public identifyUser(verificationId: string) {
    const verificationRecord = this.getVerificationRecordById(verificationId);

    assertThat(
      verificationRecord,
      new RequestError({ code: 'session.verification_session_not_found', status: 404 })
    );

    // Throws an 404 error if the user is not found by the given verification record
    // TODO: refactor using real-time user verification. Static verifiedUserId will be removed.
    assertThat(
      verificationRecord.verifiedUserId,
      new RequestError({
        code: 'user.user_not_exist',
        status: 404,
      })
    );

    // Throws an 409 error if the current session has already identified a different user
    if (this.accountId) {
      assertThat(
        this.accountId === verificationRecord.verifiedUserId,
        new RequestError({ code: 'session.identity_conflict', status: 409 })
      );
      return;
    }

    this.accountId = verificationRecord.verifiedUserId;
  }

  /**
   * Append a new verification record to the current interaction.
   * If a record with the same type already exists, it will be replaced.
   */
  public setVerificationRecord(record: VerificationRecord) {
    const { type } = record;

    this.verificationRecords.set(type, record);
  }

  public getVerificationRecordById(verificationId: string) {
    return this.verificationRecordsArray.find((record) => record.id === verificationId);
  }

  /** Save the current interaction result. */
  public async save() {
    // `mergeWithLastSubmission` will only merge current request's interaction results.
    // Manually merge with previous interaction results here.
    // @see {@link https://github.com/panva/node-oidc-provider/blob/c243bf6b6663c41ff3e75c09b95fb978eba87381/lib/actions/authorization/interactions.js#L106}

    const { provider } = this.tenant;
    const details = await provider.interactionDetails(this.ctx.req, this.ctx.res);

    await provider.interactionResult(
      this.ctx.req,
      this.ctx.res,
      { ...details.result, ...this.toJson() },
      { mergeWithLastSubmission: true }
    );
  }

  /** Submit the current interaction result to the OIDC provider and clear the interaction data */
  public async submit() {
    // TODO: refine the error code
    assertThat(this.accountId, 'session.verification_session_not_found');

    const { provider } = this.tenant;

    const redirectTo = await provider.interactionResult(this.ctx.req, this.ctx.res, {
      login: { accountId: this.accountId },
    });

    this.ctx.body = { redirectTo };
  }

  private get verificationRecordsArray() {
    return [...this.verificationRecords.values()];
  }

  /** Convert the current interaction to JSON, so that it can be stored as the OIDC provider interaction result */
  public toJson() {
    return {
      event: this.interactionEvent,
      accountId: this.accountId,
      profile: this.profile,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toJson()),
    };
  }
}
