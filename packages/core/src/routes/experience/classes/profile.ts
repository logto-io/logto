import { type VerificationType } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
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
   */
  async setProfileByVerificationRecord(
    type: VerificationType.EmailVerificationCode | VerificationType.PhoneVerificationCode,
    verificationId: string
  ) {
    const verificationRecord = this.interactionContext.getVerificationRecordByTypeAndId(
      type,
      verificationId
    );
    const profile = verificationRecord.toUserProfile();
    await this.setProfileWithValidation(profile);
  }

  /**
   * Set the profile data with validation.
   *
   * @throws {RequestError} 422 if the profile data already exists in the current user account.
   * @throws {RequestError} 422 if the unique identifier data already exists in another user account.
   */
  async setProfileWithValidation(profile: InteractionProfile) {
    const user = await this.interactionContext.getIdentifierUser();
    this.profileValidator.guardProfileNotExistInCurrentUserAccount(user, profile);
    await this.profileValidator.guardProfileUniquenessAcrossUsers(profile);
    this.unsafeSet(profile);
  }

  /**
   * Set password with password policy validation.
   *
   * @param reset - If true the password will be set without checking if it already exists in the current user account.
   * @throws {RequestError} 422 if the password does not meet the password policy.
   * @throws {RequestError} 422 if the password is the same as the current user's password.
   */
  async setPasswordDigestWithValidation(password: string, reset = false) {
    const user = await this.interactionContext.getIdentifierUser();
    const passwordPolicy = await this.signInExperienceValidator.getPasswordPolicy();
    const passwordValidator = new PasswordValidator(passwordPolicy, user);
    await passwordValidator.validatePassword(password, this.#data);
    const passwordDigests = await passwordValidator.createPasswordDigest(password);

    if (!reset) {
      this.profileValidator.guardProfileNotExistInCurrentUserAccount(user, passwordDigests);
    }

    this.unsafeSet(passwordDigests);
  }

  /**
   * Verifies the profile data is valid.
   *
   * @throws {RequestError} 422 if the profile data already exists in the current user account.
   * @throws {RequestError} 422 if the unique identifier data already exists in another user account.
   */
  async validateAvailability() {
    const user = await this.interactionContext.getIdentifierUser();
    this.profileValidator.guardProfileNotExistInCurrentUserAccount(user, this.#data);
    await this.profileValidator.guardProfileUniquenessAcrossUsers(this.#data);
  }

  /**
   * Checks if the user has fulfilled the mandatory profile fields.
   */
  async assertUserMandatoryProfileFulfilled() {
    const user = await this.interactionContext.getIdentifierUser();
    const mandatoryProfileFields =
      await this.signInExperienceValidator.getMandatoryUserProfileBySignUpMethods();

    const missingProfile = this.profileValidator.getMissingUserProfile(
      this.#data,
      user,
      mandatoryProfileFields
    );

    if (missingProfile.size === 0) {
      return;
    }

    // TODO: find missing profile fields from the social identity if any

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
}
