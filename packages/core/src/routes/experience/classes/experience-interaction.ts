/* eslint-disable max-lines */

import { appInsights } from '@logto/app-insights/node';
import {
  AuthenticationContextMode,
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationProofRole,
  ConnectorType,
  InteractionEvent,
  InteractionHookEvent,
  LogtoActionKey,
  LogtoAcr,
  acrSatisfies,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  loginPromptAuthenticationContextDetailsGuard,
  MfaFactor,
  MissingProfile,
  SignInIdentifier,
  type AuthenticationProof,
  type InteractionAuthenticationContext,
  type PostSignInEvent,
  type RequestedAuthenticationContext,
  type SignInExperience,
  type SubjectProofConnector,
  requestedAuthenticationContextGuard,
  VerificationType,
  type User,
} from '@logto/schemas';
import { maskEmail, maskPhone } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { buildUserPasswordPayload } from '#src/libraries/user.utils.js';
import { type LogEntry } from '#src/middleware/koa-audit-log.js';
import { getClientIdentifierPayload } from '#src/oidc/cimd/index.js';
import { stepUpSatisfiedBySessionKey } from '#src/oidc/interaction-policy.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import {
  interactionStorageGuard,
  type InteractionStorage,
  type Interaction,
  type InteractionContext,
  type WithHooksAndLogsContext,
  type SanitizedInteractionStorageData,
} from '../types.js';

import {
  getNewUserProfileFromVerificationRecord,
  identifyUserByVerificationRecord,
  mergeUserMfaVerifications,
  parseMfaPropertiesToUserConfig,
} from './helpers.js';
import { validatePostSignInActionResult } from './libraries/action-result-validation.js';
import { AdaptiveMfaValidator } from './libraries/adaptive-mfa-validator/index.js';
import { type AdaptiveMfaResult } from './libraries/adaptive-mfa-validator/types.js';
import {
  achieveAcr,
  aggregateAuthenticationContext,
  deriveCarriedContributions,
  type AuthenticationContribution,
} from './libraries/authentication-context.js';
import { AuthenticationProofs } from './libraries/authentication-proofs.js';
import { CaptchaValidator } from './libraries/captcha-validator.js';
import { MfaValidator, isMfaVerificationRecord } from './libraries/mfa-validator.js';
import { ProvisionLibrary } from './libraries/provision-library.js';
import { SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';
import {
  computeStepUpEligibility,
  mayEstablishFirstFactor,
  mfaFactorToVerificationType,
  type EstablishableMethod,
  type StepUpEligibility,
  type StepUpEligibilityInput,
} from './libraries/step-up-eligibility.js';
import { UserUpdateLibrary } from './libraries/user-update-library.js';
import { Mfa } from './mfa.js';
import { Profile } from './profile.js';
import { TrustedDevice } from './trusted-device.js';
import { toUserSocialIdentityData } from './utils.js';
import {
  buildVerificationRecord,
  type VerificationRecord,
  type VerificationRecordMap,
} from './verifications/index.js';
import { VerificationRecordsMap } from './verifications/verification-records-map.js';

/**
 * The login prompt details the OIDC interaction policy wrote, read from the provider interaction
 * at creation. Parsed leniently because the prompt payload is untyped, and anything that does not
 * parse is a regular sign-in.
 */
const loginPromptInteractionGuard = z.object({
  prompt: z.object({
    name: z.literal('login'),
    details: loginPromptAuthenticationContextDetailsGuard.optional(),
  }),
});

/**
 * The session fields a pure step-up reads on every request (the provider copies the session into
 * the interaction payload); see {@link ExperienceInteraction.subjectUserId} and
 * {@link ExperienceInteraction.isSessionSatisfied}.
 */
const stepUpSessionGuard = z.object({
  accountId: z.string().min(1),
  acr: z.string().optional(),
  amr: z.string().array().optional(),
});

/**
 * Read the requested authentication context from the login prompt details. `PUT /experience`
 * always re-derives the context from the prompt details, which never change, so a retry or
 * double-mount cannot drop the step-up flag and land the user in an unpinned sign-in.
 */
const readLoginPromptAuthenticationContext = (
  interactionDetails: unknown
): RequestedAuthenticationContext | undefined => {
  const result = loginPromptInteractionGuard.safeParse(interactionDetails);

  return conditional(result.success && result.data.prompt.details?.authenticationContext);
};

/**
 * The stored fields {@link isStepUpInteractionDetails} classifies on when the prompt carries no
 * context. Deliberately narrower than `interactionStorageGuard`: a field that guard rejects for
 * reasons unrelated to the mode would read as "not a step-up" and lift the route restriction, and
 * it requires `interactionEvent`, which a fresh interaction has not saved yet.
 */
const stepUpModeGuard = z.object({
  authenticationContext: requestedAuthenticationContextGuard.optional(),
});

/**
 * Whether the provider interaction record belongs to a pure step-up. Reads the same two sources
 * the interaction instance does: the login prompt details it derives the mode from at creation,
 * and the stored result it restores from. Only the routes that carry no instance
 * (`koaExperienceInteraction` skips them) are classified here; every other route reads
 * {@link ExperienceInteraction.isStepUp}. The prompt details never change, so neither source can
 * disagree with the instance.
 *
 * @throws {RequestError} with 404 if the stored result cannot be read: `false` lifts every route
 * restriction, so an unreadable record must not be mistaken for one that is not a step-up.
 */
export const isStepUpInteractionDetails = (interactionDetails: Interaction): boolean => {
  const promptContext = readLoginPromptAuthenticationContext(interactionDetails);

  if (promptContext) {
    return promptContext.mode === AuthenticationContextMode.StepUp;
  }

  const stored = stepUpModeGuard.safeParse(interactionDetails.result ?? {});

  // A record we cannot read is not a record we can clear.
  assertThat(
    stored.success,
    new RequestError({ code: 'session.interaction_not_found', status: 404 })
  );

  return stored.data.authenticationContext?.mode === AuthenticationContextMode.StepUp;
};

/**
 * The identifiers an MFA verification code can be sent to, in masked form, for the
 * `session.mfa.require_mfa_verification` payload the SPA renders.
 */
const buildMfaMaskedIdentifiers = (
  availableFactors: readonly MfaFactor[],
  { primaryEmail, primaryPhone }: User
): Record<string, string> => ({
  ...(availableFactors.includes(MfaFactor.EmailVerificationCode) && primaryEmail
    ? { [MfaFactor.EmailVerificationCode]: maskEmail(primaryEmail) }
    : {}),
  ...(availableFactors.includes(MfaFactor.PhoneVerificationCode) && primaryPhone
    ? { [MfaFactor.PhoneVerificationCode]: maskPhone(primaryPhone) }
    : {}),
});

/**
 * Whether a proof records an MFA factor enrolled and bound in this interaction, as opposed to a
 * first factor established here (a `1fa`-class `bind`, e.g. a password set through the profile).
 */
const isEnrolledFactorProof = ({ class: factorClass, role }: AuthenticationProof) =>
  role === AuthenticationProofRole.Bind &&
  (factorClass === AuthenticationFactorClass.Mfa || factorClass === AuthenticationFactorClass.Both);

/**
 * Interaction is a short-lived session session that is initiated when a user starts an interaction flow with the Logto platform.
 * This class is used to manage all the interaction data and status.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0004.
 */
export default class ExperienceInteraction {
  public readonly signInExperienceValidator: SignInExperienceValidator;
  public readonly provisionLibrary: ProvisionLibrary;
  public readonly userUpdateLibrary: UserUpdateLibrary;
  /** The user provided profile data in the current interaction that needs to be stored to database. */
  readonly profile: Profile;
  /** The user linked MFA data in the current interaction that needs to be stored to database. */
  readonly mfa: Mfa;
  /** Persisted opt-in decision and request-local trusted-device MFA verification lifecycle. */
  readonly trustedDevice: TrustedDevice;

  /** The user verification record list for the current interaction. */
  private readonly verificationRecords = new VerificationRecordsMap();
  /**
   * The userId of the user for the current interaction. Only ever written by something that
   * verified: identification, account creation, or an MFA challenge answered for the step-up
   * subject (see {@link consumeForMfa}). A pure step-up's subject is read through
   * {@link subjectUserId} until then.
   */
  private userId?: string;
  /**
   * The authentication context the OIDC interaction policy wrote into the login prompt details.
   * Copied verbatim at creation and never mutated; see {@link isStepUp}.
   */
  private readonly authenticationContext?: RequestedAuthenticationContext;
  /**
   * What the user proved about the account in this interaction, recorded at the touchpoint that
   * consumed each credential. Staged like `profile` and `mfa`, persisted by {@link save}, and
   * cleared wherever `profile.data` is cleared; see {@link AuthenticationProofs}.
   */
  private readonly authenticationProofs: AuthenticationProofs;
  private userCache?: User;
  private readonly adaptiveMfaValidator: AdaptiveMfaValidator;

  /** The captcha verification status for the current interaction. */
  private readonly captcha = {
    verified: false,
    skipped: false,
  };

  /** The interaction event for the current interaction. */
  #interactionEvent: InteractionEvent;

  /**
   * Restore experience interaction from the interaction storage.
   */
  constructor(ctx: WithHooksAndLogsContext, tenant: TenantContext, interactionDetails: Interaction);
  /**
   * Create a new `ExperienceInteraction` instance.
   *
   * When the login prompt details carry a requested authentication context, it is copied into the
   * new interaction. A pure step-up (`mode: 'stepUp'`) additionally pins the subject from the OIDC
   * session's `accountId`.
   *
   * @throws {RequestError} with 400 if a pure step-up is created with a non-`SignIn` event
   * @throws {RequestError} with 400 if a pure step-up has no session subject to pin
   */
  constructor(
    ctx: WithHooksAndLogsContext,
    tenant: TenantContext,
    interactionEvent: InteractionEvent
  );
  constructor(
    private readonly ctx: WithHooksAndLogsContext,
    private readonly tenant: TenantContext,
    interactionData: Interaction | InteractionEvent
  ) {
    const { libraries, queries } = tenant;

    this.signInExperienceValidator = new SignInExperienceValidator(libraries, queries);
    this.provisionLibrary = new ProvisionLibrary(tenant, ctx);
    this.userUpdateLibrary = new UserUpdateLibrary(tenant, ctx);

    const interactionContext: InteractionContext = {
      getInteractionEvent: () => this.#interactionEvent,
      getIdentifiedUser: async () => this.getIdentifiedUser(),
      consumeForBind: (verificationId) => this.consumeForBind(verificationId),
      consumeForBindByType: (type, verificationId) =>
        this.consumeForBindByType(type, verificationId),
      recordEstablishedPassword: () => {
        this.authenticationProofs.stageEstablishedPassword();
      },
      getCurrentProfile: () => this.profile.data,
    };

    this.adaptiveMfaValidator = new AdaptiveMfaValidator({
      ctx,
      queries,
      interactionContext,
      signInExperienceValidator: this.signInExperienceValidator,
    });

    if (typeof interactionData === 'string') {
      this.#interactionEvent = interactionData;
      this.authenticationProofs = new AuthenticationProofs();
      this.profile = new Profile(libraries, queries, {}, interactionContext);
      this.mfa = new Mfa(libraries, queries, {}, interactionContext);
      this.trustedDevice = new TrustedDevice(ctx, tenant, {});

      if (!EnvSet.values.isDevFeaturesEnabled) {
        return;
      }

      this.authenticationContext = readLoginPromptAuthenticationContext(ctx.interactionDetails);

      // The subject is not written into `userId`: nothing has been verified yet. It stays
      // readable through `subjectUserId` until an MFA challenge or an identification proves it.
      if (this.isStepUp) {
        assertThat(
          interactionData === InteractionEvent.SignIn,
          new RequestError({ code: 'session.step_up.invalid_interaction_event', status: 400 })
        );
        assertThat(
          this.subjectUserId,
          new RequestError({ code: 'session.step_up.subject_not_found', status: 400 })
        );
      }

      return;
    }

    const result = interactionStorageGuard.safeParse(interactionData.result ?? {});

    // `interactionDetails.result` is not a valid experience interaction storage
    assertThat(
      result.success,
      new RequestError({ code: 'session.interaction_not_found', status: 404 })
    );

    const {
      verificationRecords = [],
      profile = {},
      mfa = {},
      userId,
      authenticationContext,
      authenticationProofs = [],
      trustedDeviceOptIn,
      interactionEvent,
      captcha = {
        verified: false,
        skipped: false,
      },
    } = result.data;

    this.#interactionEvent = interactionEvent;
    this.userId = userId;
    this.authenticationContext = authenticationContext;
    this.authenticationProofs = new AuthenticationProofs(authenticationProofs);
    this.profile = new Profile(libraries, queries, profile, interactionContext);
    this.mfa = new Mfa(libraries, queries, mfa, interactionContext);
    this.trustedDevice = new TrustedDevice(ctx, tenant, {
      trustedDeviceOptIn,
    });
    this.captcha = captcha;
    for (const record of verificationRecords) {
      const instance = buildVerificationRecord(libraries, queries, record);
      this.verificationRecords.setValue(instance);
    }
  }

  get identifiedUserId() {
    return this.userId;
  }

  get interactionEvent() {
    return this.#interactionEvent;
  }

  /**
   * Whether this is a pure step-up: a `SignIn` interaction created from a login prompt whose
   * details carry `mode: 'stepUp'`, with the subject pinned from the OIDC session. This is the
   * only place that reads the mode; never re-parse the storage elsewhere.
   */
  get isStepUp(): boolean {
    return this.authenticationContext?.mode === AuthenticationContextMode.StepUp;
  }

  /**
   * The user this interaction is about: the identified user, or in a pure step-up the subject the
   * OIDC session pinned, read from the provider's interaction record (the session is copied into
   * it at creation, so it survives a save). Challenge paths read this to know whose secret to
   * check; it never grants the "identified" guarantee that {@link identifiedUserId} carries.
   */
  get subjectUserId(): string | undefined {
    return this.userId ?? this.stepUpSession?.accountId;
  }

  /**
   * The context the OIDC session carries into a pure step-up, derived from its `amr`; empty for
   * every other interaction. The single place the session's context is read.
   */
  get carriedContributions(): AuthenticationContribution[] {
    return deriveCarriedContributions(this.stepUpSession?.amr);
  }

  /** The session of a pure step-up, from the provider's interaction record. */
  private get stepUpSession(): z.infer<typeof stepUpSessionGuard> | undefined {
    const result = stepUpSessionGuard.safeParse(this.ctx.interactionDetails.session);

    return conditional(this.isStepUp && result.success && result.data);
  }

  /**
   * Switch the interaction event for the current interaction sign-in <> register
   *
   * - any pending profile data will be cleared
   * - any authentication proof will be cleared, so that a proof recorded for an abandoned attempt
   *   at one event can never inflate the context of another
   *
   * @throws RequestError with 403 if the interaction event is not allowed by the `SignInExperienceValidator`
   * @throws RequestError with 400 if a pure step-up switches away from `SignIn`
   * @throws RequestError with 400 if the interaction event is `ForgotPassword` and the current interaction event is not `ForgotPassword`
   * @throws RequestError with 400 if the interaction event is not `ForgotPassword` and the current interaction event is `ForgotPassword`
   */
  public async setInteractionEvent(interactionEvent: InteractionEvent) {
    // A pure step-up is a `SignIn` from creation to completion: switching the event would walk
    // past the creation assertion and reach registration with a session-pinned subject.
    assertThat(
      !this.isStepUp || interactionEvent === InteractionEvent.SignIn,
      new RequestError({ code: 'session.step_up.invalid_interaction_event', status: 400 })
    );

    await this.signInExperienceValidator.guardInteractionEvent(
      interactionEvent,
      this.verificationRecords.get(VerificationType.OneTimeToken)?.isVerified
    );

    // `ForgotPassword` interaction event can not interchanged with other events
    assertThat(
      interactionEvent === InteractionEvent.ForgotPassword
        ? this.interactionEvent === InteractionEvent.ForgotPassword
        : this.interactionEvent !== InteractionEvent.ForgotPassword,
      new RequestError({ code: 'session.not_supported_for_forgot_password', status: 400 })
    );

    if (this.#interactionEvent !== interactionEvent) {
      this.profile.cleanUp();
      this.authenticationProofs.clear();
    }

    this.#interactionEvent = interactionEvent;
  }

  /**
   * Identify the user using the verification record.
   *
   * - Check if the verification record exists.
   * - Verify the verification record with {@link SignInExperienceValidator}.
   * - Set the user id to the current interaction.
   *
   * @param linkSocialIdentity Applies only to the SocialIdentity verification record sign-in events only.
   * If true, the social identity will be linked to related user.
   *
   * @throws {RequestError} with 400 if the verification record is not verified or not valid for identifying a user
   * @throws {RequestError} with 403 if the interaction event is not allowed
   * @throws {RequestError} with 404 if the user is not found
   * @throws {RequestError} with 401 if the user is suspended
   * @throws {RequestError} with 409 if the current session has already identified a different user
   * @throws {RequestError} with 403 if a pure step-up identifies someone other than the pinned subject
   **/
  public async identifyUser(verificationId: string, linkSocialIdentity?: boolean, log?: LogEntry) {
    assertThat(
      this.interactionEvent !== InteractionEvent.Register,
      new RequestError({ code: 'session.invalid_interaction_type', status: 400 })
    );

    const verificationRecord = this.consumeForIdentify(verificationId);

    log?.append({
      verification: verificationRecord.toJson(),
    });

    await this.signInExperienceValidator.guardIdentificationMethod(
      this.interactionEvent,
      verificationRecord
    );

    // In a pure step-up an upstream authentication is only ever a subject proof: it must resolve
    // to the pinned subject by an identity already linked to it. Registration, account linking,
    // and the enterprise SSO fallback to an account related by email are never offered, and no
    // upstream profile is synced, because a step-up writes nothing but what it established.
    const { user, syncedProfile } =
      this.isStepUp &&
      (verificationRecord.type === VerificationType.Social ||
        verificationRecord.type === VerificationType.EnterpriseSso)
        ? {
            user: await this.identifyStepUpSubjectByFederatedRecord(
              verificationRecord,
              linkSocialIdentity
            ),
            syncedProfile: undefined,
          }
        : await identifyUserByVerificationRecord(verificationRecord, linkSocialIdentity);

    const { id, isSuspended } = user;
    assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

    // 409 if the interaction already identified a different user; 403 if a pure step-up identifies
    // someone other than the subject its session pinned
    assertThat(
      !this.subjectUserId || this.subjectUserId === id,
      new RequestError({ code: 'session.identity_conflict', status: this.isStepUp ? 403 : 409 })
    );

    if (this.userId) {
      return;
    }

    // Update the current interaction with the identified user
    this.userCache = user;
    this.userId = id;

    // Sync social/enterprise SSO identity profile data.
    // Note: The profile data is not saved to the user profile until the user submits the interaction.
    // Also no need to validate the synced profile data availability as it is already validated during the identification process.
    if (syncedProfile && Object.keys(syncedProfile).length > 0) {
      const log = this.ctx.createLog(`Interaction.${this.interactionEvent}.Profile.Update`);
      log.append({ syncedProfile });
      this.profile.unsafeSet(syncedProfile);
    }
  }

  /**
   * Create new user using the profile data in the current interaction.
   *
   * - if a `verificationId` is provided, the profile data will be updated with the verification record data.
   * - id no `verificationId` is provided, directly create a new user with the current profile data.
   *
   * @throws {RequestError} with 403 if the register is not allowed by the sign-in experience settings
   * @throws {RequestError} with 404 if a `verificationId` is provided but the verification record is not found
   * @throws {RequestError} with 400 if the verification record can not be used for creating a new user or not verified
   * @throws {RequestError} with 422 if the profile data is not unique across users
   * @throws {RequestError} with 422 if any of required profile fields are missing
   * @throws {RequestError} with 422 if the email domain is SSO only
   */
  public async createUser(verificationId?: string, log?: LogEntry) {
    assertThat(
      this.interactionEvent === InteractionEvent.Register,
      new RequestError({ code: 'session.invalid_interaction_type', status: 400 })
    );

    if (verificationId) {
      const verificationRecord = this.consumeForCreate(verificationId);
      const verificationData = verificationRecord.toJson();

      log?.append({
        verification: verificationData,
      });

      if (verificationRecord.type !== VerificationType.EnterpriseSso) {
        await this.signInExperienceValidator.guardSsoOnlyEmailIdentifier(verificationRecord);
      }
      await this.signInExperienceValidator.guardEmailBlocklist(verificationRecord);

      const identifierProfile = await getNewUserProfileFromVerificationRecord(verificationRecord);

      await this.profile.setProfileWithValidation(identifierProfile);
      // Save the updated profile data to the interaction storage
      await this.save();
    }

    await this.signInExperienceValidator.guardInteractionEvent(
      InteractionEvent.Register,
      this.verificationRecords.get(VerificationType.OneTimeToken)?.isVerified
    );
    await this.guardCaptcha();
    await this.profile.assertUserMandatoryProfileFulfilled({
      hasVerifiedSocialIdentity: this.hasVerifiedSocialIdentity,
      hasVerifiedSsoIdentity: this.hasVerifiedSsoIdentity,
    });

    const user = await this.provisionLibrary.createUser(this.profile.data);
    log?.append({ user });

    this.userId = user.id;
    this.userCache = user;
    this.profile.cleanUp();
  }

  /**
   * Append a new verification record to the current interaction.
   * If a record with the same type already exists, it will be replaced.
   */
  public setVerificationRecord(record: VerificationRecord) {
    this.verificationRecords.setValue(record);
  }

  /**
   * Get the verification record by the verification id with type assertion.
   *
   * @throws {RequestError} with 404 if the verification record is not found
   *  or the verification type does not match.
   */
  public getVerificationRecordByTypeAndId<K extends keyof VerificationRecordMap>(
    type: K,
    verificationId: string
  ): VerificationRecordMap[K] {
    const record = this.verificationRecords.get(type);

    assertThat(
      record?.id === verificationId,
      new RequestError({ code: 'session.verification_session_not_found', status: 404 })
    );

    return record;
  }

  /**
   * Fetch a verification record for binding the credential it carries to the account, recording
   * the `bind` proof. This and {@link consumeForBindByType} are the only ways `Profile` and `Mfa`
   * reach a record, so a bind cannot forget to record its proof; see {@link AuthenticationProofs}.
   */
  public consumeForBind(verificationId: string): VerificationRecord {
    const record = this.getVerificationRecordById(verificationId);
    this.authenticationProofs.stage(record, AuthenticationProofRole.Bind);

    return record;
  }

  /** The typed variant of {@link consumeForBind}. */
  public consumeForBindByType<K extends keyof VerificationRecordMap>(
    type: K,
    verificationId: string
  ): VerificationRecordMap[K] {
    const record = this.getVerificationRecordByTypeAndId(type, verificationId);
    this.authenticationProofs.stage(record, AuthenticationProofRole.Bind);

    return record;
  }

  /**
   * Record the `mfa` proof for an MFA challenge the user just answered. For a challenge record,
   * verifying is the use: the MFA gate scans for a verified record and no later step consumes it,
   * so the verify routes call this right after a successful verification. A new-enrollment record
   * is never a challenge; its proof is the `bind` one recorded when the factor is added.
   *
   * In a pure step-up the answered challenge is what proves the pinned subject, so it promotes
   * {@link subjectUserId} into `userId`. Every challenge record is created for the subject, so no
   * conflict check is needed here.
   *
   * @throws {RequestError} with 404 if the verification record is not found
   * @throws {RequestError} with 400 if the record is not a verified MFA challenge
   */
  public consumeForMfa<K extends keyof VerificationRecordMap>(
    type: K,
    verificationId: string
  ): VerificationRecordMap[K] {
    const record = this.getVerificationRecordByTypeAndId(type, verificationId);

    assertThat(
      isMfaVerificationRecord(record) && record.isVerified && !record.isNewBindMfaVerification,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    this.userId = this.subjectUserId;

    this.authenticationProofs.stage(record, AuthenticationProofRole.Mfa);

    return record;
  }

  /**
   * Validate the interaction verification records against the sign-in experience and user MFA settings.
   * The interaction is verified if at least one user enabled MFA verification record is present and verified.
   *
   * @remarks
   * - EnterpriseSso verified interaction does not require MFA verification.
   * - Users signing in with passkey does not require MFA verification.
   *
   * @throws {RequestError} with 404 if the if the user is not identified or not found
   * @throws {RequestError} with 403 if the mfa verification is required but not verified
   */

  public async guardMfaVerificationStatus(log?: LogEntry) {
    // A requested `mfa` is a requirement of the relying party, not of the tenant's sign-in MFA
    // policy: `skipMfaOnSignIn`, an adaptive-MFA non-trigger result and a trusted device are all
    // decisions about the tenant's policy, so none of them satisfies a class the client asked for.
    const pursued = await this.getPursuedRequestedAcr();
    const isRequestedMfaUnmet = pursued?.acr === LogtoAcr.Mfa;

    if (!isRequestedMfaUnmet && this.isMfaGateFulfilled()) {
      return;
    }

    const user = await this.getIdentifiedUser();
    const mfaSettings = await this.signInExperienceValidator.getMfaSettings();
    const adaptiveMfaResult = await this.adaptiveMfaValidator.getResult(log);

    const mfaValidator = new MfaValidator(mfaSettings, user, adaptiveMfaResult);

    // A requested `mfa` only offers the factors that pair with the first factor already proven and
    // that the eligibility offers: a factor of the same kind (an MFA email code after an email
    // sign-in) counts once and never lifts the context to `mfa`, and a code whose connector is
    // unavailable cannot be delivered at all. A user left with none of them reaches the enrollment
    // requirement of `assertMfaFulfilled`, which offers a factor that does reach the class.
    const availableFactors = isRequestedMfaUnmet
      ? this.getPairableMfaFactors(mfaValidator.availableUserMfaVerificationTypes).filter(
          (factor) =>
            (pursued.decision?.availableMethods ?? []).includes(mfaFactorToVerificationType[factor])
        )
      : mfaValidator.availableUserMfaVerificationTypes;

    // Declared non-proof: an adaptive-MFA non-trigger result skips the gate and proves nothing,
    // so it records no authentication proof.
    // A requested `mfa` is enforced here only with a pairable enrolled factor to verify with; a
    // user who has none reaches the enrollment requirement of `assertMfaFulfilled` instead.
    const isMfaRequired = isRequestedMfaUnmet
      ? availableFactors.length > 0
      : mfaValidator.isMfaRequired;

    if (!isMfaRequired) {
      return;
    }

    // A verified MFA record satisfies the tenant's policy, but while a requested `mfa` is unmet it
    // has not lifted the context, so the gate keeps asking for a pairable factor.
    if (!isRequestedMfaUnmet && mfaValidator.isMfaVerified(this.verificationRecordsArray)) {
      return;
    }

    // Declared non-proof: a trusted device satisfies the MFA gate but proves nothing now, so it
    // records no authentication proof and the context stays at what the first factor reached. It
    // fulfills the tenant's policy only and is never consulted for a requested `mfa`.
    const isMfaVerifiedWithTrustedDevice =
      !isRequestedMfaUnmet && (await this.trustedDevice.tryVerifyMfa(user.id));

    this.assignAdaptiveMfaHookResult(user.id, adaptiveMfaResult);

    if (isMfaVerifiedWithTrustedDevice) {
      return;
    }

    throw new RequestError(
      { code: 'session.mfa.require_mfa_verification', status: 403 },
      {
        availableFactors,
        maskedIdentifiers: buildMfaMaskedIdentifiers(availableFactors, user),
      }
    );
  }

  /**
   * The authentication classes the authorization request asked for, in the caller's order and
   * empty when it carried no supported `acr_values`. Both a SignIn with a requested context and a
   * pure step-up treat them as one more completion requirement of their completion path: no
   * selection is persisted, the class pursued is re-derived from these values on every read, and
   * the request cannot change mid-flow.
   */
  private get requestedAcrValues(): LogtoAcr[] {
    return this.authenticationContext?.requestedAcrValues ?? [];
  }

  /**
   * Enrollment cannot supply its own first-factor precondition. Apply the same rule to pure
   * step-up and SignIn with requested ACR, without changing ordinary sign-in or registration.
   */
  private get countedAuthenticationProofs(): readonly AuthenticationProof[] {
    const { proofs } = this.authenticationProofs;

    if (
      !this.isStepUp &&
      (this.interactionEvent !== InteractionEvent.SignIn || this.requestedAcrValues.length === 0)
    ) {
      return proofs;
    }

    return proofs.filter((proof) => this.hasFreshFirstFactor || !isEnrolledFactorProof(proof));
  }

  /**
   * Whether the interaction has proven a Logto-verifiable first factor: a proof of class `1fa` or
   * `both`, verified or established in this interaction. An `mfa`-class proof never satisfies it:
   * one alone reaches only `urn:logto:acr:1fa`, so a requested `mfa` still needs the first-factor
   * side of the pair from a different factor. Only the proofs of this interaction are read: the
   * session's stored context and a trusted device never satisfy it.
   *
   * In a pure step-up it gates the enrollment routes (see `koaStepUpRouteGuard`) and decides
   * whether a factor enrolled here counts in {@link submitStepUp}, so the two cannot disagree.
   */
  public get hasFreshFirstFactor(): boolean {
    // A factor enrolled in this interaction never supplies it, a `both`-class passkey included:
    // enrolling is licensed by a fresh first factor, so it must not license itself.
    return this.authenticationProofs.proofs.some(
      (proof) =>
        (proof.class === AuthenticationFactorClass.FirstFactor ||
          proof.class === AuthenticationFactorClass.Both) &&
        !isEnrolledFactorProof(proof)
    );
  }

  /**
   * Whether the interaction holds a fresh subject proof: a proof that identified or created the
   * user (including an upstream social / SSO authentication that resolved to the pinned subject),
   * or any Logto-verifiable `1fa`-class proof. Like {@link hasFreshFirstFactor} it reads only the
   * proofs of this interaction: the session's stored context and a trusted device never satisfy
   * it, so a session cookie alone can establish nothing.
   */
  private get hasFreshSubjectProof(): boolean {
    return this.authenticationProofs.proofs.some(
      ({ role, factor, class: factorClass }) =>
        role === AuthenticationProofRole.Identify ||
        role === AuthenticationProofRole.Create ||
        factor === AuthenticationFactor.Federated ||
        factorClass === AuthenticationFactorClass.FirstFactor ||
        factorClass === AuthenticationFactorClass.Both
    );
  }

  /**
   * Guard the first-factor requirement a requested authentication context adds to the sign-in
   * completion chain, right before {@link guardMfaVerificationStatus} so a first factor is proven
   * before an MFA factor is asked for, and before the first side effect. It applies when the
   * pursued class (see {@link getPursuedRequestedAcr}) is `1fa` or `mfa` and the interaction has
   * proven no Logto-verifiable first factor yet. With an eligible method the user can verify, it
   * throws `session.step_up.require_verification` carrying the pursued class, the methods and the
   * masked identifiers, and the next `submit()` re-evaluates the requirement from scratch. Once a
   * first factor is proven, the same requirement asks for another one when it pairs with no MFA
   * factor the user can verify or enroll: a first factor only lifts the context together with a
   * factor of a different kind.
   *
   * With no eligible method but a fresh subject proof, `user.missing_profile` offers the methods
   * the tenant lets the user establish. If the requested class cannot be reached, even through
   * establishment or enrollment, finish with an OIDC error before any sign-in side effect.
   *
   * @returns The redirect URL when the interaction was finished as unmet.
   */
  public async guardFirstFactor(): Promise<string | undefined> {
    if (this.interactionEvent !== InteractionEvent.SignIn) {
      return;
    }

    const pursued = await this.getPursuedRequestedAcr();

    if (!pursued?.decision) {
      return;
    }

    const { acr: selectedAcr, decision } = pursued;

    // This also covers a proven first factor on a tenant with no way to reach requested MFA.
    if (!decision.isReachable) {
      return this.finishUnmetAuthenticationRequirements();
    }

    if (this.hasFreshFirstFactor) {
      // A proven first factor only lifts the context together with an MFA factor of a different
      // kind. When nothing pairs with it, ask for another first factor the eligibility offers, so
      // the methods the sanitized context advertises can actually complete the request.
      if (await this.hasPairableMfaFactor(decision)) {
        return;
      }

      const firstFactorMethods = decision.availableMethods.filter(
        (method) => getAuthenticationFactorClass(method) !== AuthenticationFactorClass.Mfa
      );

      if (firstFactorMethods.length > 0) {
        throw new RequestError(
          { code: 'session.step_up.require_verification', status: 403 },
          {
            selectedAcr,
            availableMethods: firstFactorMethods,
            maskedIdentifiers: decision.maskedIdentifiers,
          }
        );
      }

      return;
    }

    if (decision.availableMethods.length > 0) {
      throw new RequestError(
        { code: 'session.step_up.require_verification', status: 403 },
        {
          selectedAcr,
          availableMethods: decision.availableMethods,
          maskedIdentifiers: decision.maskedIdentifiers,
        }
      );
    }

    if (decision.establishableMethods.length > 0) {
      throw new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: decision.establishableMethods, isEstablishment: true }
      );
    }
  }

  /**
   * Guard current interaction is identified and the identified user exists.
   *
   * @throws {RequestError} with 404 if the user is not identified or not found
   */
  public async guardIdentifiedUser() {
    await this.getIdentifiedUser();
  }

  /** Record an explicit trusted-device decision after validating eligible MFA proof. */
  public async setTrustedDeviceOptInDecision(trusted: boolean) {
    const user = await this.getIdentifiedUser();
    await this.trustedDevice.setOptInDecision({
      trusted,
      interactionEvent: this.#interactionEvent,
      userId: user.id,
      hasEligibleMfaProof: trusted && (await this.hasEligibleTrustedDeviceProof(user)),
    });
  }

  /**
   * Verify the captcha token using current tenant's captcha provider.
   *
   * @param token The captcha token to verify.
   *
   * @throws {RequestError} with 422 if the captcha verification fails
   */
  public async verifyCaptcha(token: string) {
    const log = this.ctx.createLog('Interaction.Create.Captcha');
    const captchaProvider = await this.tenant.queries.captchaProviders.findCaptchaProvider();

    assertThat(captchaProvider, new RequestError({ code: 'session.captcha_failed', status: 422 }));

    const captchaValidator = new CaptchaValidator(captchaProvider, log);
    const isVerified = await captchaValidator.verifyCaptcha(token);

    assertThat(isVerified, new RequestError({ code: 'session.captcha_failed', status: 422 }));

    this.captcha.verified = true;
  }

  /**
   * Skip the captcha verification for the current interaction,
   * for social, sso, etc.
   */
  public skipCaptcha() {
    this.captcha.skipped = true;
  }

  /**
   * The step-up decision the route guard of a pure step-up gates the establishment and
   * subject-proof routes on; the same one `GET /experience/interaction` projects. Evaluated for the
   * class the step-up pursues, which is re-derived on every read from the requested list and the
   * subject's reachable methods.
   */
  public async getStepUpEligibility(): Promise<StepUpEligibility | undefined> {
    if (!this.isStepUp) {
      return;
    }

    const pursued = await this.getPursuedAcr();

    return pursued?.decision;
  }

  /**
   * Resolve a pure step-up at creation, before any UI is rendered:
   *
   * - The class the step-up pursues is already satisfied by the OIDC session and the request does
   *   not force a fresh authentication event (`prompt=login` or an unmet `max_age`): the
   *   interaction is finished with the session's context, so no verification is asked for and
   *   `auth_time` is not refreshed. This is how `[mfa, 1fa]` on a `1fa` session with no reachable
   *   `mfa` completes at `1fa`.
   * - The pinned user cannot reach the pursued class with the methods they have: the interaction is
   *   finished with `unmet_authentication_requirements`, which the provider returns to the
   *   client's `redirect_uri` as a standard OIDC error, instead of rendering a step-up UI with
   *   nothing to offer.
   *
   * A step-up that has to ask for something, and any other interaction, is left untouched.
   *
   * @returns The URL to redirect the user to when the interaction was finished here, and whether
   * it was finished as unmet.
   */
  public async finishStepUpAtCreation(): Promise<
    { redirectTo: string; unmet?: boolean } | undefined
  > {
    if (!this.isStepUp) {
      return;
    }

    const pursued = await this.getPursuedAcr();

    if (!pursued) {
      return;
    }

    if (pursued.decision?.isReachable) {
      if (!this.isSessionSatisfied(pursued.acr)) {
        return;
      }

      // Submitting the interaction without a `login` result leaves the session untouched: its
      // `acr`, `amr`, and `auth_time` already satisfy the request, and nothing was verified here.
      // The marker tells the policy's resume check that a step-up finished here, since there is no
      // `login` to read and the route alone cannot tell it from a revisit of the authorization URL.
      const redirectTo = await this.tenant.provider.interactionResult(this.ctx.req, this.ctx.res, {
        ...this.toJson(),
        [stepUpSatisfiedBySessionKey]: true,
      });

      return { redirectTo };
    }

    return { redirectTo: await this.finishUnmetAuthenticationRequirements(), unmet: true };
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
    this.ctx.prependAllLogEntries({ interaction: interactionData, userId: this.userId });
  }

  /**
   * Submit the current interaction result to the OIDC provider and clear the interaction data
   *
   * @throws {RequestError} with 404 if the user is not identified
   * @throws {RequestError} with 403 if the mfa verification is required but not verified
   * @throws {RequestError} with 403 if a requested authentication context still needs a
   * first factor the user can verify (`session.step_up.require_verification`)
   * @throws {RequestError} with 403 if the derived context does not satisfy the requested
   * authentication class (`session.step_up.acr_not_satisfied`); nothing is written
   * @throws {RequestError} with 422 if the profile data is conflicting with the current user account
   * @throws {RequestError} with 422 if the profile data is not unique across users
   * @throws {RequestError} with 422 if the required profile fields are missing
   **/
  // eslint-disable-next-line complexity
  public async submit(log?: LogEntry) {
    const {
      queries: { users: userQueries, userSsoIdentities: userSsoIdentityQueries },
      libraries: {
        socials: { upsertSocialTokenSetSecret },
        ssoConnectors: { upsertEnterpriseSsoTokenSetSecret },
      },
    } = this.tenant;

    await this.guardCaptcha();

    // Identified
    const user = await this.getIdentifiedUser();

    // Forgot Password: No need to verify MFAs and profile data for forgot password flow
    if (this.#interactionEvent === InteractionEvent.ForgotPassword) {
      const { passwordEncrypted, passwordEncryptionMethod } = this.profile.data;

      assertThat(
        passwordEncrypted && passwordEncryptionMethod,
        new RequestError({ code: 'user.new_password_required_in_profile', status: 422 })
      );

      const updatedUser = await userQueries.updateUserById(user.id, {
        ...buildUserPasswordPayload({
          passwordEncrypted,
          passwordEncryptionMethod,
        }),
      });

      await this.cleanUp();

      this.ctx.assignReleaseOnSuccessInteractionHookResult({ userId: user.id });
      this.ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      return;
    }

    // The first-factor requirement of a requested authentication context joins the chain right
    // before the MFA verification gate, so a first factor is proven before an MFA factor is asked
    // for, all before the first side effect. A registration runs no such guard, so its request is
    // finished as unmet here instead.
    const unmetRedirectTo =
      (await this.guardFirstFactor()) ?? (await this.guardUnreachableRequestedAcr());

    if (unmetRedirectTo) {
      log?.append({ error: 'unmet_authentication_requirements' });
      this.ctx.body = { redirectTo: unmetRedirectTo };
      return;
    }

    // Verified, only SignIn requires MFA verification, for register, it does not make sense to verify MFA
    if (this.#interactionEvent === InteractionEvent.SignIn) {
      await this.guardMfaVerificationStatus(log);
    }

    // Aggregate the authentication context this sign-in or registration achieved from the proofs
    // its touchpoints recorded. The context seeds the OIDC session so the ID token carries `acr` /
    // `amr` / `auth_time`; an interaction without a proof seeds nothing and the provider stamps
    // `auth_time` itself.
    const authenticationContext = conditional(
      EnvSet.values.isDevFeaturesEnabled &&
        aggregateAuthenticationContext(this.countedAuthenticationProofs)
    );

    // Revalidate the new profile data if any
    await this.profile.validateAvailability();

    // Profile fulfilled
    await this.profile.assertUserMandatoryProfileFulfilled({
      hasVerifiedSocialIdentity: this.hasVerifiedSocialIdentity,
      hasVerifiedSsoIdentity: this.hasVerifiedSsoIdentity,
    });

    if (!this.hasVerifiedSsoIdentity) {
      // Check if passkey sign-in is enabled in the sign-in experience, if yes, check if user has `WebAuthn`
      // type of MFA verification record in `users.mfaVerifications`. Suggest user to add a passkey if not.
      await this.mfa.assertPasskeySignInFulfilled();
    }

    // Revalidate the new MFA data if any
    await this.mfa.checkAvailability();

    // A requested `mfa` is enforced as a no-skip mandatory policy of its own, which the SSO
    // exemption of the tenant's policy does not cover: the relying party asked for the class and
    // an upstream assertion never reaches it.
    const pursued = await this.getPursuedRequestedAcr();
    const isRequestedMfaUnmet = pursued?.acr === LogtoAcr.Mfa;
    // A registration drives no verification or establishment: the only way it reaches the class
    // it pursues is by binding a factor the eligibility says reaches it. Require that binding
    // non-skippably, and offer only those factors, so a skippable suggestion or a factor that
    // cannot complete the class does not fall through to the defense-in-depth assert below.
    const requestedEnrollmentFactors =
      this.interactionEvent === InteractionEvent.Register
        ? (pursued?.decision?.enrollableFactors ?? [])
        : [];
    const requiresRequestedEnrollment = requestedEnrollmentFactors.length > 0;

    if (!this.hasVerifiedSsoIdentity || isRequestedMfaUnmet || requiresRequestedEnrollment) {
      await this.mfa.assertMfaFulfilled({
        asNoSkipMandatoryPolicy: isRequestedMfaUnmet || requiresRequestedEnrollment,
        ...conditional(
          requiresRequestedEnrollment && { enrollmentFactors: requestedEnrollmentFactors }
        ),
      });
    }

    await this.trustedDevice.assertOptInDecision({
      interactionEvent: this.#interactionEvent,
      userId: user.id,
      getHasEligibleMfaProof: async () => this.hasEligibleTrustedDeviceProof(user),
    });

    // Defense in depth: assert once more, right before the first side effect, that the derived
    // context satisfies the class the interaction pursues. A submission below it fails with 403
    // and leaves nothing behind; the one that passes runs the side effects exactly once below and
    // finishes with the `login` result carrying the same derived context.
    assertThat(
      !(await this.getPursuedRequestedAcr()),
      new RequestError({ code: 'session.step_up.acr_not_satisfied', status: 403 })
    );

    const {
      socialIdentity,
      enterpriseSsoIdentity,
      syncedEnterpriseSsoIdentity,
      jitOrganizationIds,
      socialConnectorTokenSetSecret,
      enterpriseSsoConnectorTokenSetSecret,
      passwordEncrypted,
      passwordEncryptionMethod,
      ...rest
    } = this.profile.data;
    const userMfaVerifications = this.mfa.toUserMfaVerifications();
    const { mfaVerifications } = userMfaVerifications;

    // Update user profile
    const updatedUser = await userQueries.updateUserById(user.id, {
      ...rest,
      ...conditional(
        passwordEncrypted &&
          passwordEncryptionMethod &&
          buildUserPasswordPayload({
            passwordEncrypted,
            passwordEncryptionMethod,
          })
      ),
      ...conditional(
        socialIdentity && {
          identities: {
            ...user.identities,
            ...toUserSocialIdentityData(socialIdentity),
          },
        }
      ),
      ...conditional(
        mfaVerifications.length > 0 && {
          mfaVerifications: mergeUserMfaVerifications(user.mfaVerifications, mfaVerifications),
        }
      ),
      logtoConfig: {
        ...parseMfaPropertiesToUserConfig(
          user.logtoConfig,
          userMfaVerifications,
          this.#interactionEvent
        ),
      },
      lastSignInAt: Date.now(),
    });

    // Sync SSO identity
    if (syncedEnterpriseSsoIdentity) {
      const { identityId, issuer, detail } = syncedEnterpriseSsoIdentity;
      await userSsoIdentityQueries.updateUserSsoIdentityDetailByIdentityId(
        issuer,
        identityId,
        detail
      );
    }

    if (enterpriseSsoIdentity) {
      await this.provisionLibrary.addSsoIdentityToUser(user.id, enterpriseSsoIdentity);
    }

    // Sync social token set secret
    if (socialConnectorTokenSetSecret) {
      // Upsert token set secret should not break the normal social authentication and link flow
      await trySafe(
        async () => upsertSocialTokenSetSecret(user.id, socialConnectorTokenSetSecret),
        (error) => {
          void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
        }
      );
    }

    // Sync enterprise sso token set secret
    if (enterpriseSsoConnectorTokenSetSecret) {
      await upsertEnterpriseSsoTokenSetSecret(
        user.id,
        enterpriseSsoConnectorTokenSetSecret,
        this.ctx
      );
    }

    // Provision organizations for one-time token that carries organization IDs in the context.
    if (jitOrganizationIds) {
      await this.provisionLibrary.provisionJitOrganization({
        userId: user.id,
        organizationIds: jitOrganizationIds,
      });
    }

    await this.triggerPostSignInAction(user.id);

    const { provider } = this.tenant;
    // Do not persist a fulfilled opt-in decision in the final interaction result. A failed
    // interactionResult call leaves the previously stored decision available for a retry, while a
    // successful call makes subsequent submits a no-op for trusted-device finalization.
    const trustedDeviceOptInDecision = this.trustedDevice.consumeOptInDecision();

    const redirectTo = await provider.interactionResult(this.ctx.req, this.ctx.res, {
      login: {
        accountId: user.id,
        ...authenticationContext,
      },
      // Persist the interaction status to the OIDC session after interaction submission
      ...this.toJson(),
    });

    // Trusted-device writes happen only after the full interaction has succeeded and must not
    // turn a successful sign-in into an error.
    await trySafe(
      async () => {
        const hasEligibleMfaProof = trustedDeviceOptInDecision?.trusted
          ? await this.hasEligibleTrustedDeviceProof(updatedUser)
          : false;
        await this.trustedDevice.finalize({
          optInDecision: trustedDeviceOptInDecision,
          interactionEvent: this.#interactionEvent,
          userId: user.id,
          hasEligibleMfaProof,
          signInContext: this.adaptiveMfaValidator.getSignInContext(),
          location: this.adaptiveMfaValidator.getCurrentContext()?.location,
        });
      },
      (error) => {
        void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
      }
    );

    // The geo context is only recorded when the `submit()` function succeeds.
    // The recorded geo context will affect the evaluation results of the adaptive MFA afterwards.
    void trySafe(
      async () => this.adaptiveMfaValidator.recordSignInGeoContext(user, this.#interactionEvent),
      (error) => {
        void appInsights.trackException(error, buildAppInsightsTelemetry(this.ctx));
      }
    );

    this.ctx.body = { redirectTo };

    this.ctx.assignReleaseOnSuccessInteractionHookResult({ userId: user.id });

    if (Object.keys(this.profile.data).length > 0 || mfaVerifications.length > 0) {
      this.ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });
    }
  }

  /**
   * Complete a pure step-up interaction.
   *
   * This is an allow-list, never a `submit()` with exemptions: a sign-in guard or side effect added
   * later cannot reach a step-up by default. It asserts the interaction reached the class the
   * authorization request selected, writes only what the interaction established to the account,
   * records the payload of the dedicated step-up audit key, and finishes the provider interaction.
   *
   * Deliberately not run, unlike {@link submit}: the captcha guard, the tenant MFA and profile
   * policies, the passkey suggestion, every other `updateUserById` field including `lastSignInAt`,
   * SSO identity synchronization, social / SSO token-set upserts, JIT organization provisioning,
   * and `triggerPostSignInAction`. A `User.Data.Updated` data hook is queued only when established
   * methods are persisted; no sign-in interaction hook is queued.
   *
   * @throws {RequestError} with 400 if the interaction is not a pure step-up
   * @throws {RequestError} with 403 if the achieved context does not satisfy the class the step-up
   * pursues; the assertion runs before the subject is read, so a submission that counted no
   * verification ends here rather than as a missing subject
   * @throws {RequestError} with 404 if a counted proof never identified the subject, which the
   * allow-list blocks today: identification and an answered MFA challenge both set the user, and
   * the only proof that does not is a `bind`
   */
  public async submitStepUp(log?: LogEntry) {
    const { authenticationContext } = this;

    // Only a pure step-up completes here: the OIDC policy writes the mode and the requested list
    // together, and a `SignIn` with a requested ACR keeps neither.
    assertThat(
      this.isStepUp && authenticationContext && authenticationContext.requestedAcrValues.length > 0,
      new RequestError({ code: 'session.step_up.invalid_interaction_event', status: 400 })
    );

    const { requestedAcrValues } = authenticationContext;

    // The class is re-derived on this read, exactly as the guards and the projection derive it: the
    // first requested class the user can reach, or the first one when none is reachable. Nothing
    // pinned it earlier, so a method the user gained or lost mid-flow cannot disagree with what is
    // asserted below.
    const pursued = await this.getPursuedAcr();

    assertThat(
      pursued,
      new RequestError({ code: 'session.step_up.invalid_interaction_event', status: 400 })
    );

    // A factor enrolled in this interaction counts only on top of a fresh first factor, the same
    // predicate that gates the enrollment routes, so the route guard and the completion rule
    // cannot disagree. The session's carried context only ever pairs with a proof of this
    // interaction, so a submission that counted no verification derives nothing and fails the
    // assertion below.
    const countedProofs = this.countedAuthenticationProofs;
    const achievedContext = aggregateAuthenticationContext(
      countedProofs,
      this.carriedContributions
    );

    log?.append({
      requestedAcrValues,
      selectedAcr: pursued.acr,
      achievedAcr: achievedContext.acr,
      // The factor families the interaction proved. Auditable and unambiguous, unlike `amr`, where
      // `otp` alone cannot tell an email code from a TOTP or a backup code. Credentials never reach
      // the log; the audit-log filters already cover passwords, codes, WebAuthn and backup codes.
      factors: [...new Set(countedProofs.map(({ factor }) => factor))],
    });

    // The UI only offers sufficient methods; this is defense in depth. Thrown before anything is
    // written, so a rejected submission leaves no interaction result behind.
    assertThat(
      acrSatisfies(achievedContext.acr, pursued.acr),
      new RequestError({ code: 'session.step_up.acr_not_satisfied', status: 403 })
    );

    const user = await this.getIdentifiedUser();

    await this.persistEstablishedMethods(user);

    const { provider } = this.tenant;

    const redirectTo = await provider.interactionResult(this.ctx.req, this.ctx.res, {
      login: {
        accountId: user.id,
        ...achievedContext,
      },
      // Persist the interaction status to the OIDC session after interaction submission
      ...this.toJson(),
    });

    this.ctx.body = { redirectTo };
  }

  async guardCaptcha() {
    // Pure step-up already has an authenticated OIDC session.
    if (this.isStepUp || this.captcha.verified || this.captcha.skipped) {
      return;
    }

    await this.signInExperienceValidator.guardCaptcha();
  }

  /** Convert the current interaction to JSON, so that it can be stored as the OIDC provider interaction result */
  public toJson(): InteractionStorage {
    const { interactionEvent, userId, captcha, authenticationContext } = this;
    const signInContext = this.adaptiveMfaValidator.getSignInContext();

    return {
      interactionEvent,
      userId,
      ...conditional(authenticationContext && { authenticationContext }),
      authenticationProofs: this.authenticationProofs.data,
      ...this.trustedDevice.data,
      profile: this.profile.data,
      mfa: this.mfa.data,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toJson()),
      captcha,
      ...conditional(signInContext && { signInContext }),
    };
  }

  /**
   * The sanitized projection of the interaction for `GET /experience/interaction`, the single
   * source of step-up UI state: secrets are stripped, and the authentication context, when
   * present, carries the method lists evaluated on this read.
   */
  public async toSanitizedJson(): Promise<SanitizedInteractionStorageData> {
    // The trusted-device opt-in decision and the authentication proofs are internal
    // authentication state; a proof's role in particular never leaves the server.
    const {
      trustedDeviceOptIn: _,
      authenticationProofs: __,
      authenticationContext,
      ...interactionStorage
    } = this.toJson();

    return {
      ...interactionStorage,
      ...conditional(
        authenticationContext && {
          authenticationContext: await this.toSanitizedAuthenticationContext(authenticationContext),
        }
      ),
      profile: this.profile.sanitizedData,
      mfa: this.mfa.sanitizedData,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toSanitizedJson()),
    };
  }

  /**
   * Finish a registration whose requested class the registration flow cannot reach, with the same
   * `unmet_authentication_requirements` redirect a sign-in uses and before any side effect. A
   * registration runs neither of the sign-in guards, so without this the defense-in-depth assert
   * would reject the submission with 403 instead of returning the client to its application.
   *
   * @returns The redirect URL when the interaction was finished as unmet.
   */
  private async guardUnreachableRequestedAcr(): Promise<string | undefined> {
    if (this.interactionEvent !== InteractionEvent.Register) {
      return;
    }

    const pursued = await this.getPursuedRequestedAcr();

    if (pursued?.decision && !pursued.decision.isReachable) {
      return this.finishUnmetAuthenticationRequirements();
    }
  }

  /** Finish an unreachable authentication request without running sign-in finalization. */
  private async finishUnmetAuthenticationRequirements(): Promise<string> {
    const { provider } = this.tenant;

    return provider.interactionResult(this.ctx.req, this.ctx.res, {
      error: 'unmet_authentication_requirements',
      error_description:
        'the user has no method that can reach the requested authentication context',
    });
  }

  /**
   * Write only what the interaction established to the account: the MFA factors it bound, and the
   * first factor (password or primary email / phone) it staged on the profile. A step-up that only
   * verified existing methods has nothing here and no query runs at all. Nothing else about the user is touched: in particular `lastSignInAt`
   * keeps the value the sign-in wrote, because a step-up is not a sign-in.
   */
  private async persistEstablishedMethods(user: User) {
    const { passwordEncrypted, passwordEncryptionMethod, primaryEmail, primaryPhone } =
      this.profile.data;
    const userMfaVerifications = this.mfa.toUserMfaVerifications();
    const { mfaVerifications } = userMfaVerifications;

    const established = {
      ...conditional(
        passwordEncrypted &&
          passwordEncryptionMethod &&
          buildUserPasswordPayload({
            passwordEncrypted,
            passwordEncryptionMethod,
          })
      ),
      ...conditional(primaryEmail && { primaryEmail }),
      ...conditional(primaryPhone && { primaryPhone }),
      ...conditional(
        mfaVerifications.length > 0 && {
          mfaVerifications: mergeUserMfaVerifications(user.mfaVerifications, mfaVerifications),
          // Only written together with a bound factor: it is the persisted state of the MFA setup
          // this interaction completed, not a sign-in side effect.
          logtoConfig: {
            ...parseMfaPropertiesToUserConfig(
              user.logtoConfig,
              userMfaVerifications,
              InteractionEvent.SignIn
            ),
          },
        }
      ),
    };

    if (Object.keys(established).length === 0) {
      return;
    }

    // Revalidate what is about to be written, exactly as `submit()` does: everything here was
    // staged by an earlier request, so an identifier can have been taken by another account, or a
    // factor disabled, in between; a duplicate identifier fails with the 422 the API promises
    // instead of a raw unique-constraint error.
    await this.profile.validateAvailability();

    if (mfaVerifications.length > 0) {
      await this.mfa.checkAvailability();
    }

    const updatedUser = await this.tenant.queries.users.updateUserById(user.id, established);
    this.ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });
  }

  private async hasEligibleTrustedDeviceProof(user: User) {
    const mfaSettings = await this.signInExperienceValidator.getMfaSettings();
    const mfaValidator = new MfaValidator(mfaSettings, user);
    const hasEligibleVerification = mfaValidator.hasEligibleTrustedDeviceVerification(
      this.verificationRecordsArray,
      this.profile.data
    );

    const hasEligibleBinding = this.mfa.bindMfaFactorsArray.some(
      ({ type }) => type === MfaFactor.TOTP || type === MfaFactor.WebAuthn
    );

    return hasEligibleVerification || hasEligibleBinding;
  }

  private assignAdaptiveMfaHookResult(userId: string, adaptiveMfaResult?: AdaptiveMfaResult) {
    if (!adaptiveMfaResult?.requiresMfa) {
      return;
    }

    this.ctx.assignReleaseAnywayInteractionHookResult({
      event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
      payload: { adaptiveMfaResult },
      userId,
    });
  }

  private async triggerPostSignInAction(userId: string) {
    if (this.#interactionEvent !== InteractionEvent.SignIn) {
      return;
    }

    const {
      libraries: { actions, jwtCustomizers },
    } = this.tenant;
    const actionResult = validatePostSignInActionResult({
      userId,
      result: await actions.runAction({
        key: LogtoActionKey.PostSignIn,
        auditContext: {
          createLog: this.ctx.createLog,
          sessionId: this.ctx.interactionDetails.jti,
          ...getClientIdentifierPayload(
            conditional(
              typeof this.ctx.interactionDetails.params.client_id === 'string' &&
                this.ctx.interactionDetails.params.client_id
            )
          ),
          userId,
        },
        getEvent: async (): Promise<PostSignInEvent> => ({
          key: LogtoActionKey.PostSignIn,
          interactionEvent: InteractionEvent.SignIn,
          user: await jwtCustomizers.getUserContext(userId),
        }),
      }),
    });

    if (actionResult.action === 'updateUser') {
      await this.provisionLibrary.updateUser(actionResult.userId, actionResult.user, {
        mergeCustomData: true,
      });
    }
  }

  private get verificationRecordsArray() {
    return this.verificationRecords.array();
  }

  /**
   * Whether what the interaction proved already fulfills the tenant MFA gate while no requested
   * `mfa` is owed: an SSO or passkey sign-in satisfies the policy without a verification, and a
   * request that listed `mfa` and reached it here has proved a first factor plus a distinct MFA
   * factor, at least what the policy asks for. A factor bound in this interaction is a new-bind
   * record the gate never accepts, so without the latter the gate could only re-offer the
   * challenge the enrollment just replaced.
   */
  private isMfaGateFulfilled(): boolean {
    return (
      this.hasVerifiedSsoIdentity ||
      this.hasVerifiedSignInPasskey ||
      (this.requestedAcrValues.includes(LogtoAcr.Mfa) &&
        acrSatisfies(achieveAcr(this.countedAuthenticationProofs), LogtoAcr.Mfa))
    );
  }

  /**
   * The factors that can fill the `mfa` side of a pair with the first factors this interaction has
   * proven: a factor is kept when one of those first factors is of a different kind, so the two
   * together reach `mfa`. A factor of the same kind as every proven first factor is dropped,
   * because repeated records of one factor count once. With no first-factor proof, none is kept:
   * {@link guardFirstFactor} runs first, so reaching the MFA gate without one means no first factor
   * can be proven, and an `mfa`-class proof alone never lifts the context.
   */
  private getPairableMfaFactors(factors: readonly MfaFactor[]): MfaFactor[] {
    if (!this.hasFreshFirstFactor) {
      return [];
    }

    const firstFactors = new Set(
      this.authenticationProofs.proofs
        .filter(({ class: factorClass }) => factorClass === AuthenticationFactorClass.FirstFactor)
        .map(({ factor }) => factor)
    );

    return factors.filter((factor) => {
      const mfaFactor = getAuthenticationFactor(mfaFactorToVerificationType[factor]);

      return [...firstFactors].some((firstFactor) => firstFactor !== mfaFactor);
    });
  }

  /**
   * Whether an MFA factor the user can verify or enroll can pair with a first factor this
   * interaction has proven: one of a different kind, so the two together reach `mfa`. The factor
   * must also be one the eligibility offers, which is where the connector availability of the
   * code-based factors is applied.
   */
  private async hasPairableMfaFactor(decision: StepUpEligibility): Promise<boolean> {
    if (decision.enrollableFactors.length > 0) {
      return true;
    }

    const [user, mfaSettings] = await Promise.all([
      this.getIdentifiedUser(),
      this.signInExperienceValidator.getMfaSettings(),
    ]);
    const availableMethods = new Set(decision.availableMethods);

    return this.getPairableMfaFactors(
      new MfaValidator(mfaSettings, user).availableUserMfaVerificationTypes
    ).some((factor) => availableMethods.has(mfaFactorToVerificationType[factor]));
  }

  /**
   * Whether the OIDC session's recorded context already satisfies the given class, and the request
   * does not force a fresh authentication event. Reads the session's `acr`, the same value the
   * policy re-checks when the interaction resumes, rather than the carried contributions: `amr`
   * alone cannot tell some classes apart, and the session's recorded class is authoritative for a
   * step-up that verifies nothing.
   */
  private isSessionSatisfied(acr: LogtoAcr): boolean {
    return (
      !this.authenticationContext?.reauthenticationRequired &&
      acrSatisfies(this.stepUpSession?.acr, acr)
    );
  }

  /**
   * The requested class the interaction is pursuing, re-derived on every read and never persisted:
   * the first requested class the user can reach with the methods they have, or the first one when
   * none is reachable. `undefined` once what the interaction has proven satisfies that class, or
   * when the request carries no class.
   *
   * `acr_values` is an ordered list of preferences, so a weaker listed class never ends the
   * pursuit while an earlier one is still reachable: `[mfa, 1fa]` on a password sign-in keeps
   * asking for MFA while the user or the tenant can reach it, and only falls back to `1fa` when
   * `mfa` cannot be reached. Only the proofs of this interaction are read; enrolled factors are
   * never consulted for satisfaction.
   */
  private async getPursuedRequestedAcr(): Promise<
    { acr: LogtoAcr; decision?: StepUpEligibility } | undefined
  > {
    const achievedAcr = achieveAcr(this.countedAuthenticationProofs);
    const [firstAcr] = this.requestedAcrValues;

    // A satisfied first class is also the pursued one: `distanceTo` is 0 for it, so it is reachable,
    // and the lookup below returns `undefined` all the same. Skipping it spares the subject,
    // connector and eligibility lookups of every listed class on the happy path, which `submit()`
    // asks for four times.
    if (firstAcr && acrSatisfies(achievedAcr, firstAcr)) {
      return;
    }

    const pursued = await this.getPursuedAcr();

    if (!pursued || acrSatisfies(achievedAcr, pursued.acr)) {
      return;
    }

    return pursued;
  }

  /**
   * The class the interaction pursues, whether or not it is already satisfied: the first requested
   * class the user can reach, or the first requested one when none is reachable. `undefined` when
   * the interaction carries no requested class.
   */
  private async getPursuedAcr(): Promise<
    { acr: LogtoAcr; decision?: StepUpEligibility } | undefined
  > {
    const { requestedAcrValues } = this;
    const [firstAcr] = requestedAcrValues;

    if (!firstAcr) {
      return;
    }

    const decisions = await Promise.all(
      requestedAcrValues.map(async (acr) => ({ acr, decision: await this.getStepUpDecision(acr) }))
    );

    return (
      decisions.find(({ decision }) => decision?.isReachable) ?? {
        acr: firstAcr,
        decision: decisions[0]?.decision,
      }
    );
  }

  /**
   * The step-up decision for the subject and the class the interaction pursues: what
   * `PUT /experience` acts on and `GET /experience/interaction` projects, computed from the same
   * inputs so the two cannot disagree. Evaluated on read and never persisted. `undefined` while no
   * subject is known. Every caller passes the class it pursues (see {@link getPursuedAcr}); a pure
   * step-up pairs the context its session carries.
   */
  private async getStepUpDecision(selectedAcr: LogtoAcr): Promise<StepUpEligibility | undefined> {
    const { subjectUserId } = this;

    if (!subjectUserId) {
      return;
    }

    // The subject is fetched without touching the identified user's cache: it may be unproven,
    // and `getIdentifiedUser` must keep failing until something verified it.
    const [user, mfaSettings, connectors] = await Promise.all([
      this.tenant.queries.users.findUserById(subjectUserId),
      this.signInExperienceValidator.getMfaSettings(),
      this.tenant.connectors.getLogtoConnectors(),
    ]);
    const messageConnectors = {
      email: connectors.some(({ type }) => type === ConnectorType.Email),
      sms: connectors.some(({ type }) => type === ConnectorType.Sms),
    };

    const input = {
      user,
      mfaSettings,
      selectedAcr,
      connectors: messageConnectors,
      carried: this.carriedContributions,
      proofs: this.countedAuthenticationProofs,
    } satisfies StepUpEligibilityInput;

    return computeStepUpEligibility({
      ...input,
      ...(await this.getEnrollmentInput(input, connectors)),
    });
  }

  /**
   * The enrollment inputs of the interaction. A registration drives only what its flow holds: the
   * identifier and profile it recorded, and the TOTP / WebAuthn factors `assertMfaFulfilled`
   * requires, which it binds without proving a first factor first. A step-up or sign-in also offers
   * establishing a first factor and the factors the tenant lets the user enroll. An ordinary
   * sign-in never gets this far, since it carries no requested class.
   */
  private async getEnrollmentInput(
    input: StepUpEligibilityInput,
    connectors: Awaited<ReturnType<TenantContext['connectors']['getLogtoConnectors']>>
  ): Promise<Partial<StepUpEligibilityInput>> {
    if (this.interactionEvent === InteractionEvent.Register) {
      const configuredFactors = await this.signInExperienceValidator.getConfiguredMfaFactors();

      return {
        hasFreshSubjectProof: this.hasFreshSubjectProof,
        hasFreshFirstFactor: this.hasFreshFirstFactor,
        // A registration prompts for neither establishing nor verifying another first factor: the
        // identifier it verified is already a proof. Only the factors `assertMfaFulfilled` requires
        // can be bound, and a `both`-class WebAuthn factor reaches `mfa` on its own.
        tenantEstablishableMethods: [],
        tenantEnrollableFactors: configuredFactors.filter(
          (factor) => factor === MfaFactor.TOTP || factor === MfaFactor.WebAuthn
        ),
        linkedConnectors: [],
        registration: true,
      };
    }

    return this.isStepUp || this.interactionEvent === InteractionEvent.SignIn
      ? this.getStepUpEnrollmentInput(input, connectors)
      : {};
  }

  /**
   * The enrollment inputs shared by pure step-up and SignIn with requested ACR: the predicates
   * read only this interaction's proofs, and the tenant decides what can be established or enrolled.
   */
  private async getStepUpEnrollmentInput(
    input: StepUpEligibilityInput,
    connectors: Awaited<ReturnType<TenantContext['connectors']['getLogtoConnectors']>>
  ): Promise<Partial<StepUpEligibilityInput>> {
    const { user, mfaSettings, connectors: messageConnectors } = input;
    const { hasFreshSubjectProof } = this;
    const [
      {
        signIn: { methods },
        singleSignOnEnabled,
        socialSignInConnectorTargets,
      },
      bindableFactors,
    ] = await Promise.all([
      this.signInExperienceValidator.getSignInExperienceData(),
      this.signInExperienceValidator.getBindableMfaFactors(),
    ]);
    const isIdentifierEnabled = (identifier: SignInIdentifier) =>
      methods.some((method) => method.identifier === identifier);

    const tenantEstablishableMethods: EstablishableMethod[] = [
      ...(methods.some(({ password }) => password) ? [MissingProfile.password as const] : []),
      ...(isIdentifierEnabled(SignInIdentifier.Email) && messageConnectors.email
        ? [MissingProfile.email as const]
        : []),
      ...(isIdentifierEnabled(SignInIdentifier.Phone) && messageConnectors.sms
        ? [MissingProfile.phone as const]
        : []),
    ];

    // The linked connectors only matter to a pure step-up whose user holds no subject proof yet
    // and has nothing to verify, so every other read skips the lookups.
    const needsSubjectProof =
      this.isStepUp &&
      tenantEstablishableMethods.length > 0 &&
      !hasFreshSubjectProof &&
      mayEstablishFirstFactor(input);

    return {
      hasFreshSubjectProof,
      hasFreshFirstFactor: this.hasFreshFirstFactor,
      tenantEstablishableMethods,
      // Only the factors whose enrollment is itself a proof: binding backup codes proves nothing,
      // and the email / phone factors are bound through an identifier, which a pure step-up only
      // accepts for establishing a first factor.
      // SignIn must offer the configured MFA factors `assertMfaFulfilled` requires, not a
      // passkey-only suggestion that can be skipped without fulfilling the requested class.
      tenantEnrollableFactors: bindableFactors.filter(
        (factor) =>
          (factor === MfaFactor.TOTP || factor === MfaFactor.WebAuthn) &&
          (this.isStepUp || mfaSettings.factors.includes(factor))
      ),
      linkedConnectors: needsSubjectProof
        ? await this.getLinkedConnectors(user, connectors, {
            singleSignOnEnabled,
            socialSignInConnectorTargets,
          })
        : [],
    };
  }

  /**
   * The subject's linked social and enterprise SSO connectors that are still available on the
   * sign-in experience, so every connector returned is one the sign-in page can render.
   */
  private async getLinkedConnectors(
    { id, identities }: User,
    connectors: Awaited<ReturnType<TenantContext['connectors']['getLogtoConnectors']>>,
    {
      singleSignOnEnabled,
      socialSignInConnectorTargets,
    }: Pick<SignInExperience, 'singleSignOnEnabled' | 'socialSignInConnectorTargets'>
  ): Promise<SubjectProofConnector[]> {
    const [ssoIdentities, ssoConnectors] = await Promise.all([
      this.tenant.queries.userSsoIdentities.findUserSsoIdentitiesByUserId(id),
      singleSignOnEnabled ? this.tenant.libraries.ssoConnectors.getAvailableSsoConnectors() : [],
    ]);
    const linkedTargets = new Set(Object.keys(identities));

    return [
      ...connectors
        .filter(
          ({ type, metadata: { target } }) =>
            type === ConnectorType.Social &&
            linkedTargets.has(target) &&
            socialSignInConnectorTargets.includes(target)
        )
        .map(({ dbEntry }) => ({ type: 'social' as const, connectorId: dbEntry.id })),
      ...ssoConnectors
        .filter((connector) =>
          ssoIdentities.some(({ ssoConnectorId }) => ssoConnectorId === connector.id)
        )
        .map((connector) => ({ type: 'sso' as const, connectorId: connector.id })),
    ];
  }

  /**
   * The authentication context for the sanitized projection: the stored context plus the class the
   * interaction pursues and the lists computed on this read. Neither mode persists a selection —
   * a pure step-up and a SignIn or Register with requested ACR both re-derive it from the requested
   * list and the subject's reachable methods — so the SPA renders the class the guards enforce and
   * never one the interaction has already passed over. `selectedAcr` is absent while no subject is
   * known.
   */
  private async toSanitizedAuthenticationContext(
    authenticationContext: RequestedAuthenticationContext
  ): Promise<InteractionAuthenticationContext> {
    const pursued = await this.getPursuedAcr();
    const decision = pursued?.decision;

    return {
      ...authenticationContext,
      ...conditional(pursued && decision && { selectedAcr: pursued.acr }),
      availableMethods: decision?.availableMethods ?? [],
      establishableMethods: decision?.establishableMethods ?? [],
      enrollableFactors: decision?.enrollableFactors ?? [],
      subjectProofConnectors: decision?.subjectProofConnectors ?? [],
      maskedIdentifiers: decision?.maskedIdentifiers ?? {},
    };
  }

  /**
   * Assert the interaction is identified and return the identified user.
   * @throws RequestError with 404 if the if the user is not identified or not found
   */
  private async getIdentifiedUser(): Promise<User> {
    if (this.userCache) {
      return this.userCache;
    }

    // Identified
    assertThat(
      this.userId,
      new RequestError({
        code: 'session.identifier_not_found',
        status: 404,
      })
    );

    const {
      queries: { users: userQueries },
    } = this.tenant;

    const user = await userQueries.findUserById(this.userId);

    this.userCache = user;
    return this.userCache;
  }

  /**
   * @throws {RequestError} with 404 if the verification record is not found
   */
  private getVerificationRecordById(verificationId: string) {
    const verificationRecord = this.verificationRecordsArray.find(
      (record) => record.id === verificationId
    );

    assertThat(
      verificationRecord,
      new RequestError({ code: 'session.verification_session_not_found', status: 404 })
    );

    return verificationRecord;
  }

  /**
   * Resolve the pinned subject of a pure step-up from a verified social or enterprise SSO record.
   *
   * @throws {RequestError} with 403 if the upstream identity resolves to another account or to no
   * account, or if the request asks to link the identity
   */
  private async identifyStepUpSubjectByFederatedRecord(
    verificationRecord: VerificationRecordMap[
      | VerificationType.Social
      | VerificationType.EnterpriseSso],
    linkSocialIdentity?: boolean
  ): Promise<User> {
    const conflict = new RequestError({ code: 'session.identity_conflict', status: 403 });

    assertThat(!linkSocialIdentity, conflict);

    // Only an upstream identity linked to no account is a conflict; anything else, such as a
    // database error, keeps its own error.
    const user = await verificationRecord.identifyUser().catch((error: unknown) => {
      if (
        error instanceof RequestError &&
        (error.code === 'user.identity_not_exist' || error.code === 'user.sso_identity_not_exist')
      ) {
        throw conflict;
      }

      throw error;
    });

    assertThat(user.id === this.subjectUserId, conflict);

    return user;
  }

  /** Fetch a verification record for creating the account from it, recording the `create` proof. */
  private consumeForCreate(verificationId: string) {
    const record = this.getVerificationRecordById(verificationId);
    this.authenticationProofs.stage(record, AuthenticationProofRole.Create);

    return record;
  }

  /** Fetch a verification record for identifying the user with it, recording the `identify` proof. */
  private consumeForIdentify(verificationId: string) {
    const record = this.getVerificationRecordById(verificationId);
    this.authenticationProofs.stage(record, AuthenticationProofRole.Identify);

    return record;
  }

  private get hasVerifiedSsoIdentity() {
    const ssoVerificationRecord = this.verificationRecords.get(VerificationType.EnterpriseSso);

    return Boolean(ssoVerificationRecord?.isVerified);
  }

  private get hasVerifiedSocialIdentity() {
    const socialVerificationRecord = this.verificationRecords.get(VerificationType.Social);
    return Boolean(socialVerificationRecord?.isVerified);
  }

  private get hasVerifiedSignInPasskey() {
    const webAuthnVerificationRecord = this.verificationRecords.get(VerificationType.SignInPasskey);
    return Boolean(webAuthnVerificationRecord?.isVerified);
  }

  /**
   * Clean up the interaction storage.
   */
  private async cleanUp() {
    const { provider } = this.tenant;
    // Proofs are interaction-scoped and must never be visible to a subsequent interaction.
    this.authenticationProofs.clear();
    await provider.interactionResult(this.ctx.req, this.ctx.res, {});
  }
}
/* eslint-enable max-lines */
