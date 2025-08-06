/* eslint-disable max-lines */
import { appInsights } from '@logto/app-insights/node';
import { InteractionEvent, VerificationType, type User } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { type LogEntry } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

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
} from './helpers.js';
import { CaptchaValidator } from './libraries/captcha-validator.js';
import { MfaValidator } from './libraries/mfa-validator.js';
import { ProvisionLibrary } from './libraries/provision-library.js';
import { SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';
import { Mfa, userMfaDataKey } from './mfa.js';
import { Profile } from './profile.js';
import { toUserSocialIdentityData } from './utils.js';
import {
  buildVerificationRecord,
  type VerificationRecord,
  type VerificationRecordMap,
} from './verifications/index.js';
import { VerificationRecordsMap } from './verifications/verification-records-map.js';

/**
 * Interaction is a short-lived session session that is initiated when a user starts an interaction flow with the Logto platform.
 * This class is used to manage all the interaction data and status.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0004.
 */
export default class ExperienceInteraction {
  public readonly signInExperienceValidator: SignInExperienceValidator;
  public readonly provisionLibrary: ProvisionLibrary;
  /** The user provided profile data in the current interaction that needs to be stored to database. */
  readonly profile: Profile;
  /** The user linked MFA data in the current interaction that needs to be stored to database. */
  readonly mfa: Mfa;

  /** The user verification record list for the current interaction. */
  private readonly verificationRecords = new VerificationRecordsMap();
  /** The userId of the user for the current interaction. Only available once the user is identified. */
  private userId?: string;
  private userCache?: User;

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

    const interactionContext: InteractionContext = {
      getInteractionEvent: () => this.#interactionEvent,
      getIdentifiedUser: async () => this.getIdentifiedUser(),
      getVerificationRecordByTypeAndId: (type, verificationId) =>
        this.getVerificationRecordByTypeAndId(type, verificationId),
      getVerificationRecordById: (verificationId) => this.getVerificationRecordById(verificationId),
      getCurrentProfile: () => this.profile.data,
    };

    if (typeof interactionData === 'string') {
      this.#interactionEvent = interactionData;
      this.profile = new Profile(libraries, queries, {}, interactionContext);
      this.mfa = new Mfa(libraries, queries, {}, interactionContext);
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
      interactionEvent,
      captcha = {
        verified: false,
        skipped: false,
      },
    } = result.data;

    this.#interactionEvent = interactionEvent;
    this.userId = userId;
    this.profile = new Profile(libraries, queries, profile, interactionContext);
    this.mfa = new Mfa(libraries, queries, mfa, interactionContext);
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
   * Switch the interaction event for the current interaction sign-in <> register
   *
   * - any pending profile data will be cleared
   *
   * @throws RequestError with 403 if the interaction event is not allowed by the `SignInExperienceValidator`
   * @throws RequestError with 400 if the interaction event is `ForgotPassword` and the current interaction event is not `ForgotPassword`
   * @throws RequestError with 400 if the interaction event is not `ForgotPassword` and the current interaction event is `ForgotPassword`
   */
  public async setInteractionEvent(interactionEvent: InteractionEvent) {
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
   **/
  public async identifyUser(verificationId: string, linkSocialIdentity?: boolean, log?: LogEntry) {
    assertThat(
      this.interactionEvent !== InteractionEvent.Register,
      new RequestError({ code: 'session.invalid_interaction_type', status: 400 })
    );

    const verificationRecord = this.getVerificationRecordById(verificationId);

    log?.append({
      verification: verificationRecord.toJson(),
    });

    await this.signInExperienceValidator.guardIdentificationMethod(
      this.interactionEvent,
      verificationRecord
    );

    const { user, syncedProfile } = await identifyUserByVerificationRecord(
      verificationRecord,
      linkSocialIdentity
    );

    const { id, isSuspended } = user;
    assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

    // Throws an 409 error if the current session has already identified a different user
    if (this.userId) {
      assertThat(
        this.userId === id,
        new RequestError({ code: 'session.identity_conflict', status: 409 })
      );
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
      const verificationRecord = this.getVerificationRecordById(verificationId);
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
    await this.profile.assertUserMandatoryProfileFulfilled();

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
   * Validate the interaction verification records against the sign-in experience and user MFA settings.
   * The interaction is verified if at least one user enabled MFA verification record is present and verified.
   *
   * @remarks
   * - EnterpriseSso verified interaction does not require MFA verification.
   *
   * @throws {RequestError} with 404 if the if the user is not identified or not found
   * @throws {RequestError} with 403 if the mfa verification is required but not verified
   */
  public async guardMfaVerificationStatus() {
    if (this.hasVerifiedSsoIdentity) {
      return;
    }

    const user = await this.getIdentifiedUser();
    const mfaSettings = await this.signInExperienceValidator.getMfaSettings();
    const mfaValidator = new MfaValidator(mfaSettings, user);
    const isVerified = mfaValidator.isMfaVerified(this.verificationRecordsArray);

    assertThat(
      isVerified,
      new RequestError(
        { code: 'session.mfa.require_mfa_verification', status: 403 },
        { availableFactors: mfaValidator.availableUserMfaVerificationTypes }
      )
    );
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
   * @throws {RequestError} with 422 if the profile data is conflicting with the current user account
   * @throws {RequestError} with 422 if the profile data is not unique across users
   * @throws {RequestError} with 422 if the required profile fields are missing
   **/
  // eslint-disable-next-line complexity
  public async submit() {
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
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      await this.cleanUp();

      this.ctx.assignInteractionHookResult({ userId: user.id });
      this.ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      return;
    }

    // Verified
    await this.guardMfaVerificationStatus();

    // Revalidate the new profile data if any
    await this.profile.validateAvailability();

    // Profile fulfilled
    if (!this.hasVerifiedSsoIdentity) {
      await this.profile.assertUserMandatoryProfileFulfilled();
    }

    // Revalidate the new MFA data if any
    await this.mfa.checkAvailability();

    // MFA fulfilled
    if (!this.hasVerifiedSsoIdentity) {
      await this.mfa.assertUserMandatoryMfaFulfilled();
    }

    const {
      socialIdentity,
      enterpriseSsoIdentity,
      syncedEnterpriseSsoIdentity,
      jitOrganizationIds,
      socialConnectorTokenSetSecret,
      enterpriseSsoConnectorTokenSetSecret,
      ...rest
    } = this.profile.data;
    const { mfaSkipped, mfaVerifications } = this.mfa.toUserMfaVerifications();

    // Update user profile
    const updatedUser = await userQueries.updateUserById(user.id, {
      ...rest,
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
      ...conditional(
        mfaSkipped && {
          logtoConfig: {
            ...user.logtoConfig,
            [userMfaDataKey]: {
              skipped: true,
            },
          },
        }
      ),
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
          void appInsights.trackException(error);
        }
      );
    }

    // Sync enterprise sso token set secret
    if (enterpriseSsoConnectorTokenSetSecret) {
      await upsertEnterpriseSsoTokenSetSecret(user.id, enterpriseSsoConnectorTokenSetSecret);
    }

    // Provision organizations for one-time token that carries organization IDs in the context.
    if (jitOrganizationIds) {
      await this.provisionLibrary.provisionJitOrganization({
        userId: user.id,
        organizationIds: jitOrganizationIds,
      });
    }

    const { provider } = this.tenant;

    const redirectTo = await provider.interactionResult(this.ctx.req, this.ctx.res, {
      login: { accountId: user.id },
      // Persist the interaction status to the OIDC session after interaction submission
      ...this.toJson(),
    });

    this.ctx.body = { redirectTo };

    this.ctx.assignInteractionHookResult({ userId: user.id });

    if (Object.keys(this.profile.data).length > 0 || mfaVerifications.length > 0) {
      this.ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });
    }
  }

  async guardCaptcha() {
    if (this.captcha.verified || this.captcha.skipped) {
      return;
    }

    await this.signInExperienceValidator.guardCaptcha();
  }

  /** Convert the current interaction to JSON, so that it can be stored as the OIDC provider interaction result */
  public toJson(): InteractionStorage {
    const { interactionEvent, userId, captcha } = this;

    return {
      interactionEvent,
      userId,
      profile: this.profile.data,
      mfa: this.mfa.data,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toJson()),
      captcha,
    };
  }

  public toSanitizedJson(): SanitizedInteractionStorageData {
    const { interactionEvent, userId, captcha } = this;

    return {
      interactionEvent,
      userId,
      profile: this.profile.sanitizedData,
      mfa: this.mfa.sanitizedData,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toSanitizedJson()),
      captcha,
    };
  }

  private get verificationRecordsArray() {
    return this.verificationRecords.array();
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

  private get hasVerifiedSsoIdentity() {
    const ssoVerificationRecord = this.verificationRecords.get(VerificationType.EnterpriseSso);

    return Boolean(ssoVerificationRecord?.isVerified);
  }

  /**
   * Clean up the interaction storage.
   */
  private async cleanUp() {
    const { provider } = this.tenant;
    await provider.interactionResult(this.ctx.req, this.ctx.res, {});
  }
}
/* eslint-enable max-lines */
