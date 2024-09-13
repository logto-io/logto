import { InteractionEvent, VerificationType } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { type LogEntry } from '#src/middleware/koa-audit-log.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { type InteractionContext, type InteractionProfile } from '../types.js';

import { PasswordValidator } from './libraries/password-validator.js';
import { ProfileValidator } from './libraries/profile-validator.js';
import { SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';

export class Profile {
  readonly profileValidator: ProfileValidator;
  private readonly signInExperienceValidator: SignInExperienceValidator;
  #data: InteractionProfile;

  constructor(
    private readonly libraries: Libraries,
    queries: Queries,
    data: InteractionProfile,
    private readonly interactionContext: InteractionContext
  ) {
    this.signInExperienceValidator = new SignInExperienceValidator(libraries, queries);
    this.profileValidator = new ProfileValidator(queries);
    this.#data = data;
  }

  get data() {
    return this.#data;
  }

  /**
   * Set the identified email or phone to the profile using the verification record.
   *
   * @throws {RequestError} 422 if the profile data already exists in the current user account.
   * @throws {RequestError} 422 if the unique identifier data already exists in another user account.
   * @throws {RequestError} 422 if the email domain is SSO only.
   */
  async setProfileByVerificationRecord(
    type: VerificationType.EmailVerificationCode | VerificationType.PhoneVerificationCode,
    verificationId: string,
    log?: LogEntry
  ) {
    const verificationRecord = this.interactionContext.getVerificationRecordByTypeAndId(
      type,
      verificationId
    );

    log?.append({
      verification: verificationRecord.toJson(),
    });

    if (verificationRecord.type === VerificationType.EmailVerificationCode) {
      await this.signInExperienceValidator.guardSsoOnlyEmailIdentifier(verificationRecord);
    }

    const profile = verificationRecord.toUserProfile();

    await this.setProfileWithValidation(profile);
  }

  async setProfileBySocialVerificationRecord(verificationId: string, log?: LogEntry) {
    const verificationRecord = this.interactionContext.getVerificationRecordByTypeAndId(
      VerificationType.Social,
      verificationId
    );

    log?.append({
      verification: verificationRecord.toJson(),
    });

    const profile = await verificationRecord.toUserProfile();
    await this.setProfileWithValidation(profile);

    const user = await this.safeGetIdentifiedUser();
    const isNewUserIdentity = !user;

    // Sync the email and phone to the user profile only for new user identity
    const syncedProfile = await verificationRecord.toSyncedProfile(isNewUserIdentity);
    this.unsafePrepend(syncedProfile);
  }

  /**
   * Set the profile data with validation.
   *
   * @throws {RequestError} 422 if the profile data already exists in the current user account. (Existing user profile only)
   * @throws {RequestError} 422 if the unique identifier data already exists in another user account.
   */
  async setProfileWithValidation(profile: InteractionProfile) {
    const user = await this.safeGetIdentifiedUser();

    if (user) {
      this.profileValidator.guardProfileNotExistInCurrentUserAccount(user, profile);
    }

    await this.profileValidator.guardProfileUniquenessAcrossUsers(profile);
    this.unsafeSet(profile);
  }

  /**
   * Set password with password policy validation.
   *
   * @param reset - If true the password will be set without checking if it already exists in the current user account.
   * @throws {RequestError} 422 if the password does not meet the password policy.
   * @throws {RequestError} 422 if the password is the same as the current user's password. (Existing user profile only)
   */
  async setPasswordDigestWithValidation(password: string, reset = false) {
    const user = await this.safeGetIdentifiedUser();
    const passwordPolicy = await this.signInExperienceValidator.getPasswordPolicy();
    const passwordValidator = new PasswordValidator(passwordPolicy, user);
    await passwordValidator.validatePassword(password, this.#data);
    const passwordDigests = await passwordValidator.createPasswordDigest(password);

    if (user && !reset) {
      this.profileValidator.guardProfileNotExistInCurrentUserAccount(user, passwordDigests);
    }

    this.unsafeSet(passwordDigests);
  }

  /**
   * Verifies the profile data is valid.
   *
   * @throws {RequestError} 422 if the profile data already exists in the current user account. (Existing user profile only)
   * @throws {RequestError} 422 if the unique identifier data already exists in another user account.
   */
  async validateAvailability() {
    const user = await this.safeGetIdentifiedUser();

    if (user) {
      this.profileValidator.guardProfileNotExistInCurrentUserAccount(user, this.#data);
    }

    await this.profileValidator.guardProfileUniquenessAcrossUsers(this.#data);
  }

  /**
   * Checks if the user has fulfilled the mandatory profile fields.
   *
   * - Skip the check if the profile contains an enterprise SSO identity.
   */
  async assertUserMandatoryProfileFulfilled() {
    const user = await this.safeGetIdentifiedUser();

    if (this.#data.enterpriseSsoIdentity) {
      return;
    }

    const mandatoryProfileFields =
      await this.signInExperienceValidator.getMandatoryUserProfileBySignUpMethods();

    const missingProfile = this.profileValidator.getMissingUserProfile(
      this.#data,
      mandatoryProfileFields,
      user
    );

    if (missingProfile.size === 0) {
      return;
    }

    throw new RequestError(
      { code: 'user.missing_profile', status: 422 },
      { missingProfile: [...missingProfile] }
    );
  }

  unsafeSet(profile: InteractionProfile) {
    this.#data = {
      ...this.#data,
      ...profile,
    };
  }

  /**
   * Prepend the profile data to the existing profile data.
   * Avoid overwriting the existing profile data.
   */
  unsafePrepend(profile: InteractionProfile) {
    this.#data = {
      ...profile,
      ...this.#data,
    };
  }

  cleanUp() {
    this.#data = {};
  }

  /**
   * Safely get the identified user from the interaction context.
   * If the interaction event is register, the user will be retrieved safely.
   *
   * @returns The identified user from the interaction context.
   */
  private async safeGetIdentifiedUser() {
    const { getInteractionEvent, getIdentifiedUser } = this.interactionContext;

    const interactionEvent = getInteractionEvent();

    if (interactionEvent === InteractionEvent.Register) {
      return trySafe(async () => getIdentifiedUser());
    }

    return getIdentifiedUser();
  }
}
