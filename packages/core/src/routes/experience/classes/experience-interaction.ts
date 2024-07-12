import { type ToZodObject } from '@logto/connector-kit';
import { InteractionEvent, VerificationType } from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import type { Interaction } from '../types.js';

import { validateSieVerificationMethod } from './utils.js';
import {
  buildVerificationRecord,
  verificationRecordDataGuard,
  type VerificationRecord,
  type VerificationRecordData,
} from './verifications/index.js';

type InteractionStorage = {
  interactionEvent?: InteractionEvent;
  userId?: string;
  profile?: Record<string, unknown>;
  verificationRecords?: VerificationRecordData[];
};

const interactionStorageGuard = z.object({
  interactionEvent: z.nativeEnum(InteractionEvent).optional(),
  userId: z.string().optional(),
  profile: z.object({}).optional(),
  verificationRecords: verificationRecordDataGuard.array().optional(),
}) satisfies ToZodObject<InteractionStorage>;

/**
 * Interaction is a short-lived session session that is initiated when a user starts an interaction flow with the Logto platform.
 * This class is used to manage all the interaction data and status.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0004.
 */
export default class ExperienceInteraction {
  /** The user verification record list for the current interaction. */
  private readonly verificationRecords = new Map<VerificationType, VerificationRecord>();
  /** The userId of the user for the current interaction. Only available once the user is identified. */
  private userId?: string;
  /** The user provided profile data in the current interaction that needs to be stored to database. */
  private readonly profile?: Record<string, unknown>; // TODO: Fix the type
  /** The interaction event for the current interaction. */
  #interactionEvent?: InteractionEvent;

  /**
   * Create a new `ExperienceInteraction` instance.
   *
   * If the `interactionDetails` is provided, the instance will be initialized with the data from the `interactionDetails` storage.
   * Otherwise, a brand new instance will be created.
   */
  constructor(
    private readonly ctx: WithLogContext,
    private readonly tenant: TenantContext,
    public interactionDetails?: Interaction
  ) {
    const { libraries, queries } = tenant;

    if (!interactionDetails) {
      return;
    }

    const result = interactionStorageGuard.safeParse(interactionDetails.result ?? {});

    assertThat(
      result.success,
      new RequestError({ code: 'session.interaction_not_found', status: 404 })
    );

    const { verificationRecords = [], profile, userId, interactionEvent } = result.data;

    this.#interactionEvent = interactionEvent;
    this.userId = userId;
    this.profile = profile;

    for (const record of verificationRecords) {
      const instance = buildVerificationRecord(libraries, queries, record);
      this.verificationRecords.set(instance.type, instance);
    }
  }

  get identifiedUserId() {
    return this.userId;
  }

  get interactionEvent() {
    return this.#interactionEvent;
  }

  /** Set the interaction event for the current interaction */
  public setInteractionEvent(interactionEvent: InteractionEvent) {
    // TODO: conflict event check (e.g. reset password session can't be used for sign in)
    this.#interactionEvent = interactionEvent;
  }

  /**
   * Identify the user using the verification record.
   *
   * - Check if the verification record exists.
   * - Check if the verification record is valid for the current interaction event.
   * - Create a new user using the verification record if the current interaction event is `Register`.
   * - Identify the user using the verification record if the current interaction event is `SignIn` or `ForgotPassword`.
   * - Set the user id to the current interaction.
   *
   * @throws RequestError with 404 if the verification record is not found
   * @throws RequestError with 404 if the interaction event is not set
   * @throws RequestError with 400 if the verification record is not valid for the current interaction event
   * @throws RequestError with 401 if the user is suspended
   * @throws RequestError with 409 if the current session has already identified a different user
   **/
  public async identifyUser(verificationId: string) {
    const verificationRecord = this.getVerificationRecordById(verificationId);

    assertThat(
      verificationRecord && this.interactionEvent,
      new RequestError({ code: 'session.verification_session_not_found', status: 404 })
    );

    // Existing user identification flow
    validateSieVerificationMethod(this.interactionEvent, verificationRecord);

    // User creation flow
    if (this.interactionEvent === InteractionEvent.Register) {
      this.createNewUser(verificationRecord);
      return;
    }

    switch (verificationRecord.type) {
      case VerificationType.Password:
      case VerificationType.VerificationCode:
      case VerificationType.Social:
      case VerificationType.EnterpriseSso: {
        // TODO: social sign-in with verified email

        const { id, isSuspended } = await verificationRecord.identifyUser();

        assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

        // Throws an 409 error if the current session has already identified a different user
        if (this.userId) {
          assertThat(
            this.userId === id,
            new RequestError({ code: 'session.identity_conflict', status: 409 })
          );
          return;
        }

        this.userId = id;
        break;
      }
      default: {
        // Unsupported verification type for identification, such as MFA verification.
        throw new RequestError({ code: 'session.verification_failed', status: 400 });
      }
    }
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
    const { provider } = this.tenant;
    const details = await provider.interactionDetails(this.ctx.req, this.ctx.res);
    const interactionData = this.toJson();

    // `mergeWithLastSubmission` will only merge current request's interaction results.
    // Manually merge with previous interaction results here.
    // @see {@link https://github.com/panva/node-oidc-provider/blob/c243bf6b6663c41ff3e75c09b95fb978eba87381/lib/actions/authorization/interactions.js#L106}
    await provider.interactionResult(
      this.ctx.req,
      this.ctx.res,
      { ...details.result, ...interactionData },
      { mergeWithLastSubmission: true }
    );

    // Prepend the interaction data to all log entries
    this.ctx.prependAllLogEntries({ interaction: interactionData });
  }

  /** Submit the current interaction result to the OIDC provider and clear the interaction data */
  public async submit() {
    // TODO: refine the error code
    assertThat(this.userId, 'session.verification_session_not_found');

    const { provider } = this.tenant;

    const redirectTo = await provider.interactionResult(this.ctx.req, this.ctx.res, {
      login: { accountId: this.userId },
    });

    this.ctx.body = { redirectTo };
  }

  /** Convert the current interaction to JSON, so that it can be stored as the OIDC provider interaction result */
  public toJson(): InteractionStorage {
    const { interactionEvent, userId, profile } = this;

    return {
      interactionEvent,
      userId,
      profile,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toJson()),
    };
  }

  private get verificationRecordsArray() {
    return [...this.verificationRecords.values()];
  }

  private createNewUser(verificationRecord: VerificationRecord) {
    // TODO: create new user for the Register event
  }
}
