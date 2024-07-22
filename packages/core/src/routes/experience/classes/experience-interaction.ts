import { type ToZodObject } from '@logto/connector-kit';
import { InteractionEvent, type User, type VerificationType } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionProfileGuard, type Interaction, type InteractionProfile } from '../types.js';

import { ProvisionLibrary } from './provision-library.js';
import {
  getNewUserProfileFromVerificationRecord,
  identifyUserByVerificationRecord,
  toUserSocialIdentityData,
} from './utils.js';
import { MfaValidator } from './validators/mfa-validator.js';
import { ProfileValidator } from './validators/profile-validator.js';
import { SignInExperienceValidator } from './validators/sign-in-experience-validator.js';
import {
  buildVerificationRecord,
  verificationRecordDataGuard,
  type VerificationRecord,
  type VerificationRecordData,
} from './verifications/index.js';

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
  public readonly profileValidator: ProfileValidator;
  public readonly provisionLibrary: ProvisionLibrary;

  /** The user verification record list for the current interaction. */
  private readonly verificationRecords = new Map<VerificationType, VerificationRecord>();
  /** The userId of the user for the current interaction. Only available once the user is identified. */
  private userId?: string;
  private userCache?: User;
  /** The user provided profile data in the current interaction that needs to be stored to database. */
  #profile?: InteractionProfile;
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

    if (!interactionDetails) {
      this.profileValidator = new ProfileValidator(libraries, queries);
      return;
    }

    const result = interactionStorageGuard.safeParse(interactionDetails.result ?? {});

    // `interactionDetails.result` is not a valid experience interaction storage
    assertThat(
      result.success,
      new RequestError({ code: 'session.interaction_not_found', status: 404 })
    );

    const { verificationRecords = [], profile, userId, interactionEvent } = result.data;

    this.#interactionEvent = interactionEvent;
    this.userId = userId;
    this.#profile = profile;

    // Profile validator requires the userId for existing user profile update validation
    this.profileValidator = new ProfileValidator(libraries, queries);

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
    const { type } = record;

    this.verificationRecords.set(type, record);
  }

  public getVerificationRecordById(verificationId: string) {
    return this.verificationRecordsArray.find((record) => record.id === verificationId);
  }

  /**
   * Validate the interaction verification records against the sign-in experience and user MFA settings.
   *
   * The interaction is verified if at least one user enabled MFA verification record is present and verified.
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

  /** Submit the current interaction result to the OIDC provider and clear the interaction data */
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

    // Verified
    if (this.#interactionEvent !== InteractionEvent.ForgotPassword) {
      await this.guardMfaVerificationStatus();
    }

    const { socialIdentity, enterpriseSsoIdentity, ...rest } = this.#profile ?? {};

    // TODO: profile updates validation

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

    // TODO: missing profile fields validation

    if (enterpriseSsoIdentity) {
      await userSsoIdentitiesQueries.insert({
        id: generateStandardId(),
        userId: user.id,
        ...enterpriseSsoIdentity,
      });
      await this.provisionLibrary.newUserJtiOrganizationProvision(user.id, {
        enterpriseSsoIdentity,
      });
    }

    const { provider } = this.tenant;

    const redirectTo = await provider.interactionResult(this.ctx.req, this.ctx.res, {
      login: { accountId: user.id },
    });

    this.ctx.body = { redirectTo };
  }

  /** Convert the current interaction to JSON, so that it can be stored as the OIDC provider interaction result */
  public toJson(): InteractionStorage {
    const { interactionEvent, userId } = this;

    return {
      interactionEvent,
      userId,
      profile: this.#profile,
      verificationRecords: this.verificationRecordsArray.map((record) => record.toJson()),
    };
  }

  private get verificationRecordsArray() {
    return [...this.verificationRecords.values()];
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

    // Sync social/enterprise SSO identity profile data
    if (syncedProfile) {
      this.setProfile(syncedProfile);
    }

    this.userId = id;
  }

  /**
   * Create a new user using the verification record.
   *
   * @throws {RequestError} with 422 if the profile data is not unique across users
   * @throws {RequestError} with 400 if the verification record is invalid for creating a new user or not verified
   */
  private async createNewUser(verificationRecord: VerificationRecord) {
    const {
      libraries: {
        users: { generateUserId, insertUser },
      },
      queries: { userSsoIdentities: userSsoIdentitiesQueries },
    } = this.tenant;

    const newProfile = await getNewUserProfileFromVerificationRecord(verificationRecord);

    await this.profileValidator.guardProfileUniquenessAcrossUsers(newProfile);

    const { socialIdentity, enterpriseSsoIdentity, ...rest } = newProfile;

    const { isCreatingFirstAdminUser, initialUserRoles, customData } =
      await this.provisionLibrary.getUserProvisionContext(newProfile);

    const [user] = await insertUser(
      {
        id: await generateUserId(),
        ...rest,
        ...conditional(socialIdentity && { identities: toUserSocialIdentityData(socialIdentity) }),
        ...conditional(customData && { customData }),
      },
      initialUserRoles
    );

    if (isCreatingFirstAdminUser) {
      await this.provisionLibrary.adminUserProvision(user);
    }

    if (enterpriseSsoIdentity) {
      await userSsoIdentitiesQueries.insert({
        id: generateStandardId(),
        userId: user.id,
        ...enterpriseSsoIdentity,
      });
    }

    await this.provisionLibrary.newUserJtiOrganizationProvision(user.id, newProfile);

    // TODO: new user hooks

    this.userId = user.id;
  }

  /**
   * Private method to set the profile data without validation.
   */
  private setProfile(profile: InteractionProfile) {
    this.#profile = {
      ...this.#profile,
      ...profile,
    };
  }

  /**
   * Assert the interaction is identified and return the identified user.
   *
   * @throws RequestError with 400 if the user is not identified
   * @throws RequestError with 404 if the user is not found
   */
  private async getIdentifiedUser(): Promise<User> {
    if (this.userCache) {
      return this.userCache;
    }

    // Identified
    assertThat(this.userId, 'session.identifier_not_found');

    const {
      queries: { users: userQueries },
    } = this.tenant;

    const user = await userQueries.findUserById(this.userId);

    this.userCache = user;
    return this.userCache;
  }
}
