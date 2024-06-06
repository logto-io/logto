import { InteractionEvent } from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import type { Interaction } from './type.js';
import {
  buildVerificationRecord,
  verificationRecordDataGuard,
  type Verification,
  type VerificationType,
} from './verifications/index.js';

const interactionSessionResultGuard = z.object({
  event: z.nativeEnum(InteractionEvent).optional(),
  accountId: z.string().optional(),
  profile: z.object({}).optional(),
  verificationRecords: verificationRecordDataGuard.array().optional(),
});

/**
 * InteractionSession status management
 *
 * @overview
 * Interaction session is a session that is initiated when a user starts an interaction flow with the Logto platform.
 * This class is used to manage all the interaction session data and status.
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0004.
 *
 */
export default class InteractionSession {
  /**
   * Factory method to create a new InteractionSession using context
   */
  static async create(ctx: WithLogContext, tenant: TenantContext) {
    const { provider } = tenant;
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    return new InteractionSession(ctx, tenant, interactionDetails);
  }

  /** The interaction event for the current interaction session */
  readonly interactionEvent?: InteractionEvent;
  /** The user verification record list for the current interaction session */
  private readonly verificationRecords: Set<Verification>;
  /** The accountId of the user for the current interaction session. Only available once the user is identified */
  private accountId?: string;
  /** The user provided profile data in the current interaction session that needs to be stored to user DB */
  private readonly profile?: Record<string, unknown>; // TODO: Fix the type

  constructor(
    private readonly ctx: WithLogContext,
    private readonly tenant: TenantContext,
    interactionDetails: Interaction
  ) {
    const { libraries, queries } = tenant;

    const result = interactionSessionResultGuard.safeParse(interactionDetails.result);

    assertThat(
      result.success,
      new RequestError({ code: 'session.interaction_not_found', status: 404 })
    );

    const { verificationRecords = [], profile, accountId, event } = result.data;

    this.interactionEvent = event;
    this.accountId = accountId;
    this.profile = profile;

    this.verificationRecords = new Set(
      verificationRecords.map((record) => buildVerificationRecord(libraries, queries, record))
    );
  }

  /** Set the verified accountId of the current interaction session from  the verification record */
  public identifyUser(verificationId: string) {
    const verificationRecord = this.getVerificationRecordById(verificationId);

    assertThat(verificationRecord?.verifiedUserId, 'session.identifier_not_found');

    this.accountId = verificationRecord.verifiedUserId;
  }

  /**
   * Append a new verification record to the current interaction session.
   * @remark If a record with the same type already exists, it will be replaced.
   */
  public appendVerificationRecord(record: Verification) {
    const { type } = record;

    const existingRecord = this.getVerificationRecordByType(type);

    if (existingRecord) {
      this.verificationRecords.delete(existingRecord);
    }

    this.verificationRecords.add(record);
  }

  public getVerificationRecordById(verificationId: string) {
    return this.verificationRecordsArray.find((record) => record.id === verificationId);
  }

  /** Save the current interaction session result */
  public async save() {
    // The "mergeWithLastSubmission" will only merge current request's interaction results,
    // manually merge with previous interaction results
    // refer to: https://github.com/panva/node-oidc-provider/blob/c243bf6b6663c41ff3e75c09b95fb978eba87381/lib/actions/authorization/interactions.js#L106

    const { provider } = this.tenant;
    const details = await provider.interactionDetails(this.ctx.req, this.ctx.res);

    await provider.interactionResult(
      this.ctx.req,
      this.ctx.res,
      { ...details.result, ...this.toJson() },
      { mergeWithLastSubmission: true }
    );
  }

  /** Submit the current interaction session result to the OIDC provider and clear the session */
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
    return Array.from(this.verificationRecords);
  }

  private getVerificationRecordByType(type: VerificationType) {
    return this.verificationRecordsArray.find((record) => record.type === type);
  }

  /** Convert the current interaction session to JSON, so that it can be stored as the OIDC provider interaction result */
  private toJson() {
    return {
      event: this.interactionEvent,
      accountId: this.accountId,
      profile: this.profile,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toJson()),
    };
  }
}
