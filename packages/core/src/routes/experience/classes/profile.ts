import { type User } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { type InteractionProfile } from '../types.js';

import { PasswordValidator } from './validators/password-validator.js';
import { ProfileValidator } from './validators/profile-validator.js';
import { SignInExperienceValidator } from './validators/sign-in-experience-validator.js';

export class Profile {
  readonly profileValidator: ProfileValidator;
  private readonly signInExperienceValidator: SignInExperienceValidator;
  #data: InteractionProfile;

  constructor(
    private readonly libraries: Libraries,
    queries: Queries,
    data: InteractionProfile,
    private readonly getUserFromContext: () => Promise<User>
  ) {
    this.signInExperienceValidator = new SignInExperienceValidator(libraries, queries);
    this.profileValidator = new ProfileValidator(queries);
    this.#data = data;
  }

  get data() {
    return this.#data;
  }

  /**
   * Sets the profile data with validation.
   *
   * @throws {RequestError} 422 if the profile data already exists in the current user account.
   * @throws {RequestError} 422 if the unique identifier data already exists in another user account.
   */
  async setProfileWithValidation(profile: InteractionProfile) {
    const user = await this.getUserFromContext();
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
  async encryptAndSetPassword(password: string, reset = false) {
    const user = await this.getUserFromContext();
    const passwordPolicy = await this.signInExperienceValidator.getPasswordPolicy();
    const passwordValidator = new PasswordValidator(passwordPolicy, user);
    await passwordValidator.validatePassword(password, this.#data);
    const encryptedPasswordData = await passwordValidator.encryptPassword(password);

    if (!reset) {
      this.profileValidator.guardProfileNotExistInCurrentUserAccount(user, encryptedPasswordData);
    }

    this.unsafeSet(encryptedPasswordData);
  }

  /**
   * Verifies the profile data is valid.
   *
   * @throws {RequestError} 422 if the profile data already exists in the current user account.
   * @throws {RequestError} 422 if the unique identifier data already exists in another user account.
   */
  async checkAvailability() {
    const user = await this.getUserFromContext();
    this.profileValidator.guardProfileNotExistInCurrentUserAccount(user, this.#data);
    await this.profileValidator.guardProfileUniquenessAcrossUsers(this.#data);
  }

  /**
   * Checks if the user has fulfilled the mandatory profile fields.
   */
  async assertUserMandatoryProfileFulfilled() {
    const user = await this.getUserFromContext();
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
