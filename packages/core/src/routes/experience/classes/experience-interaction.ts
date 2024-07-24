import { type ToZodObject } from '@logto/connector-kit';
import { InteractionEvent, type User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import {
  interactionProfileGuard,
  type Interaction,
  type InteractionContext,
  type InteractionProfile,
} from '../types.js';

import {
  getNewUserProfileFromVerificationRecord,
  identifyUserByVerificationRecord,
} from './helpers.js';
import { MfaValidator } from './libraries/mfa-validator.js';
import { ProvisionLibrary } from './libraries/provision-library.js';
import { SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';
import { Profile } from './profile.js';
import { toUserSocialIdentityData } from './utils.js';
import {
  buildVerificationRecord,
  verificationRecordDataGuard,
  type VerificationRecord,
  type VerificationRecordData,
  type VerificationRecordMap,
} from './verifications/index.js';
import { VerificationRecordsMap } from './verifications/verification-records-map.js';

type InteractionStorage = {
  interactionEvent?: InteractionEvent;
  userId?: string;
  profile?: InteractionProfile;
  verificationRecords?: VerificationRecordData[];
};

const interactionStorageGuard = z.object({
  interactionEvent: z.nativeEnum(InteractionEvent).optional(),
  userId: z.string().optional(),
  profile: interactionProfileGuard.optional(),
  verificationRecords: verificationRecordDataGuard.array().optional(),
}) satisfies ToZodObject<InteractionStorage>;

/**
 * Interaction is a short-lived session session that is initiated when a user starts an interaction flow with the Logto platform.
 * This class is used to manage all the interaction data and status.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0004.
 */
export default class ExperienceInteraction {
  public readonly signInExperienceValidator: SignInExperienceValidator;
  public readonly provisionLibrary: ProvisionLibrary;
  readonly profile: Profile;

  /** The user verification record list for the current interaction. */
  private readonly verificationRecords = new VerificationRecordsMap();
  /** The userId of the user for the current interaction. Only available once the user is identified. */
  private userId?: string;
  private userCache?: User;
  /** The user provided profile data in the current interaction that needs to be stored to database. */
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
    interactionDetails?: Interaction
  ) {
    const { libraries, queries } = tenant;

    this.signInExperienceValidator = new SignInExperienceValidator(libraries, queries);
    this.provisionLibrary = new ProvisionLibrary(tenant, ctx);

    const interactionContext: InteractionContext = {
      getIdentifierUser: async () => this.getIdentifiedUser(),
      getVerificationRecordByTypeAndId: (type, verificationId) =>
        this.getVerificationRecordByTypeAndId(type, verificationId),
    };

    if (!interactionDetails) {
      this.profile = new Profile(libraries, queries, {}, interactionContext);
      return;
    }

    const result = interactionStorageGuard.safeParse(interactionDetails.result ?? {});

    // `interactionDetails.result` is not a valid experience interaction storage
    assertThat(
      result.success,
      new RequestError({ code: 'session.interaction_not_found', status: 404 })
    );

    const { verificationRecords = [], profile = {}, userId, interactionEvent } = result.data;

    this.#interactionEvent = interactionEvent;
    this.userId = userId;
    this.profile = new Profile(libraries, queries, profile, interactionContext);

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
   * Set the interaction event for the current interaction
   *
   * @throws RequestError with 403 if the interaction event is not allowed by the `SignInExperienceValidator`
   * @throws RequestError with 400 if the interaction event is `ForgotPassword` and the current interaction event is not `ForgotPassword`
   * @throws RequestError with 400 if the interaction event is not `ForgotPassword` and the current interaction event is `ForgotPassword`
   */
  public async setInteractionEvent(interactionEvent: InteractionEvent) {
    await this.signInExperienceValidator.guardInteractionEvent(interactionEvent);

    // `ForgotPassword` interaction event can not interchanged with other events
    if (this.interactionEvent) {
      assertThat(
        interactionEvent === InteractionEvent.ForgotPassword
          ? this.interactionEvent === InteractionEvent.ForgotPassword
          : this.interactionEvent !== InteractionEvent.ForgotPassword,
        new RequestError({ code: 'session.not_supported_for_forgot_password', status: 400 })
      );
    }

    this.#interactionEvent = interactionEvent;
  }

  /**
   * Identify the user using the verification record.
   *
   * - Check if the verification record exists.
   * - Verify the verification record with {@link SignInExperienceValidator}.
   * - Create a new user using the verification record if the current interaction event is `Register`.
   * - Identify the user using the verification record if the current interaction event is `SignIn` or `ForgotPassword`.
   * - Set the user id to the current interaction.
   *
   * @throws RequestError with 404 if the interaction event is not set.
   * @throws RequestError with 404 if the verification record is not found.
   * @throws RequestError with 422 if the verification record is not enabled in the SIE settings.
   * @see {@link identifyExistingUser} for more exceptions that can be thrown in the SignIn and ForgotPassword events.
   * @see {@link createNewUser} for more exceptions that can be thrown in the Register event.
   **/
  public async identifyUser(verificationId: string, linkSocialIdentity?: boolean) {
    const verificationRecord = this.getVerificationRecordById(verificationId);

    assertThat(
      this.interactionEvent,
      new RequestError({ code: 'session.interaction_not_found', status: 404 })
    );

    assertThat(
      verificationRecord,
      new RequestError({ code: 'session.verification_session_not_found', status: 404 })
    );

    await this.signInExperienceValidator.verifyIdentificationMethod(
      this.interactionEvent,
      verificationRecord
    );

    if (this.interactionEvent === InteractionEvent.Register) {
      await this.createNewUser(verificationRecord);
      return;
    }

    await this.identifyExistingUser(verificationRecord, linkSocialIdentity);
  }

  /**
   * Append a new verification record to the current interaction.
   * If a record with the same type already exists, it will be replaced.
   */
  public setVerificationRecord(record: VerificationRecord) {
    this.verificationRecords.setValue(record);
  }

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
   * @throws — RequestError with 404 if the if the user is not identified or not found
   * @throws {RequestError} with 403 if the mfa verification is required but not verified
   */
  public async guardMfaVerificationStatus() {
    const user = await this.getIdentifiedUser();
    const mfaSettings = await this.signInExperienceValidator.getMfaSettings();
    const mfaValidator = new MfaValidator(mfaSettings, user);
    const isVerified = mfaValidator.isMfaVerified(this.verificationRecordsArray);

    assertThat(
      isVerified,
      new RequestError(
        { code: 'session.mfa.require_mfa_verification', status: 403 },
        { availableFactors: mfaValidator.availableMfaVerificationTypes }
      )
    );
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

  /**
   * Submit the current interaction result to the OIDC provider and clear the interaction data
   *
   * @throws {RequestError} with 404 if the interaction event is not set
   * @throws {RequestError} with 404 if the user is not identified
   * @throws {RequestError} with 403 if the mfa verification is required but not verified
   * @throws {RequestError} with 422 if the profile data is conflicting with the current user account
   * @throws {RequestError} with 422 if the profile data is not unique across users
   * @throws {RequestError} with 422 if the required profile fields are missing
   **/
  public async submit() {
    const {
      queries: { users: userQueries, userSsoIdentities: userSsoIdentitiesQueries },
    } = this.tenant;

    // Initiated
    assertThat(
      this.interactionEvent,
      new RequestError({ code: 'session.interaction_not_found', status: 404 })
    );

    // Identified
    const user = await this.getIdentifiedUser();

    // Forgot Password: No need to verify MFAs and profile data for forgot password flow
    if (this.#interactionEvent === InteractionEvent.ForgotPassword) {
      const { passwordEncrypted, passwordEncryptionMethod } = this.profile.data;

      assertThat(
        passwordEncrypted && passwordEncryptionMethod,
        new RequestError({ code: 'user.new_password_required_in_profile', status: 422 })
      );

      await userQueries.updateUserById(user.id, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      await this.cleanUp();

      // TODO: User data updated hook

      return;
    }

    // Verified
    await this.guardMfaVerificationStatus();

    // Revalidate the new profile data if any
    await this.profile.validateAvailability();

    // Profile fulfilled
    await this.profile.assertUserMandatoryProfileFulfilled();

    const { socialIdentity, enterpriseSsoIdentity, ...rest } = this.profile.data;

    // Update user profile
    await userQueries.updateUserById(user.id, {
      ...rest,
      ...conditional(
        socialIdentity && {
          identities: {
            ...user.identities,
            ...toUserSocialIdentityData(socialIdentity),
          },
        }
      ),
      lastSignInAt: Date.now(),
    });

    if (enterpriseSsoIdentity) {
      await this.provisionLibrary.addSsoIdentityToUser(user.id, enterpriseSsoIdentity);
    }

    const { provider } = this.tenant;

    const redirectTo = await provider.interactionResult(this.ctx.req, this.ctx.res, {
      login: { accountId: user.id },
    });

    // TODO: PostInteractionHooks

    this.ctx.body = { redirectTo };
  }

  /** Convert the current interaction to JSON, so that it can be stored as the OIDC provider interaction result */
  public toJson(): InteractionStorage {
    const { interactionEvent, userId } = this;

    return {
      interactionEvent,
      userId,
      profile: this.profile.data,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toJson()),
    };
  }

  private get verificationRecordsArray() {
    return this.verificationRecords.array();
  }

  /**
   * Identify the existing user using the verification record.
   *
   * @param linkSocialIdentity Applies only to the SocialIdentity verification record sign-in events only.
   * If true, the social identity will be linked to related user.
   *
   * @throws RequestError with 400 if the verification record is not verified or not valid for identifying a user
   * @throws RequestError with 404 if the user is not found
   * @throws RequestError with 401 if the user is suspended
   * @throws RequestError with 409 if the current session has already identified a different user
   */
  private async identifyExistingUser(
    verificationRecord: VerificationRecord,
    linkSocialIdentity?: boolean
  ) {
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
    if (syncedProfile) {
      this.profile.unsafeSet(syncedProfile);
    }
  }

  /**
   * Create a new user using the verification record.
   *
   * @throws {RequestError} with 400 if the verification record is invalid for creating a new user or not verified
   * @throws {RequestError} with 422 if the profile data is not unique across users
   */
  private async createNewUser(verificationRecord: VerificationRecord) {
    const newProfile = await getNewUserProfileFromVerificationRecord(verificationRecord);
    await this.profile.profileValidator.guardProfileUniquenessAcrossUsers(newProfile);

    const user = await this.provisionLibrary.createUser(newProfile);

    this.userId = user.id;
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

  private getVerificationRecordById(verificationId: string) {
    return this.verificationRecordsArray.find((record) => record.id === verificationId);
  }

  /**
   * Clean up the interaction storage.
   */
  private async cleanUp() {
    const { provider } = this.tenant;
    await provider.interactionResult(this.ctx.req, this.ctx.res, {});
  }
}
