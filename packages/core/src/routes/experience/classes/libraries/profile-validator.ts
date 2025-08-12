import {
  type User,
  type JsonObject,
  jsonObjectGuard,
  MissingProfile,
  type UserProfile,
  userProfileGuard,
  signInIdentifierKeyGuard,
  reservedCustomDataKeyGuard,
  builtInCustomProfileFieldKeys,
  nameAndAvatarGuard,
  reservedBuiltInProfileKeyGuard,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import type { InteractionProfile } from '../../types.js';

export class ProfileValidator {
  constructor(private readonly queries: Queries) {}

  public async guardProfileUniquenessAcrossUsers(profile: InteractionProfile = {}) {
    const { hasUser, hasUserWithEmail, hasUserWithNormalizedPhone, hasUserWithIdentity } =
      this.queries.users;
    const { userSsoIdentities } = this.queries;

    const { username, primaryEmail, primaryPhone, socialIdentity, enterpriseSsoIdentity } = profile;

    if (username) {
      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_already_in_use',
          status: 422,
        })
      );
    }

    if (primaryEmail) {
      assertThat(
        !(await hasUserWithEmail(primaryEmail)),
        new RequestError({
          code: 'user.email_already_in_use',
          status: 422,
        })
      );
    }

    if (primaryPhone) {
      assertThat(
        !(await hasUserWithNormalizedPhone(primaryPhone)),
        new RequestError({
          code: 'user.phone_already_in_use',
          status: 422,
        })
      );
    }

    if (socialIdentity) {
      const {
        target,
        userInfo: { id },
      } = socialIdentity;

      assertThat(
        !(await hasUserWithIdentity(target, id)),
        new RequestError({
          code: 'user.identity_already_in_use',
          status: 422,
        })
      );
    }

    if (enterpriseSsoIdentity) {
      const { issuer, identityId } = enterpriseSsoIdentity;
      const userSsoIdentity = await userSsoIdentities.findUserSsoIdentityBySsoIdentityId(
        issuer,
        identityId
      );

      assertThat(
        !userSsoIdentity,
        new RequestError({
          code: 'user.identity_already_in_use',
          status: 422,
        })
      );
    }
  }

  /**
   * Validate the profile existence in the current user account
   *
   * @remarks
   * This method is used to validate the profile for the register and sign-in interaction only
   * In the register and sign-in interaction, password can only be set if it does not exist in the current user account.
   *
   */
  public guardProfileNotExistInCurrentUserAccount(user: User, profile: InteractionProfile = {}) {
    const { username, primaryEmail, primaryPhone, passwordEncrypted } = profile;

    if (username) {
      assertThat(
        !user.username,
        new RequestError({
          code: 'user.username_exists_in_profile',
          status: 422,
        })
      );
    }

    if (primaryEmail) {
      assertThat(
        !user.primaryEmail,
        new RequestError({
          code: 'user.email_exists_in_profile',
          status: 422,
        })
      );
    }

    if (primaryPhone) {
      assertThat(
        !user.primaryPhone,
        new RequestError({
          code: 'user.phone_exists_in_profile',
          status: 422,
        })
      );
    }

    if (passwordEncrypted) {
      assertThat(
        !user.passwordEncrypted,
        new RequestError({
          code: 'user.password_exists_in_profile',
          status: 422,
        })
      );
    }
  }

  // eslint-disable-next-line complexity
  public getMissingUserProfile(
    profile: InteractionProfile,
    mandatoryUserProfile: Set<MissingProfile>,
    user?: User
  ): Set<MissingProfile> {
    const missingProfile = new Set<MissingProfile>();

    if (mandatoryUserProfile.has(MissingProfile.username) && !user?.username && !profile.username) {
      missingProfile.add(MissingProfile.username);
    }

    if (
      mandatoryUserProfile.has(MissingProfile.emailOrPhone) &&
      !user?.primaryPhone &&
      !user?.primaryEmail &&
      !profile.primaryPhone &&
      !profile.primaryEmail
    ) {
      missingProfile.add(MissingProfile.emailOrPhone);
    }

    if (
      mandatoryUserProfile.has(MissingProfile.email) &&
      !user?.primaryEmail &&
      !profile.primaryEmail
    ) {
      missingProfile.add(MissingProfile.email);
    }

    if (
      mandatoryUserProfile.has(MissingProfile.phone) &&
      !user?.primaryPhone &&
      !profile.primaryPhone
    ) {
      missingProfile.add(MissingProfile.phone);
    }

    if (mandatoryUserProfile.has(MissingProfile.password)) {
      const isUserPasswordSet = user
        ? // Social and enterprise SSO identities can take place the role of password
          Boolean(user.passwordEncrypted) || Object.keys(user.identities).length > 0
        : false;

      const isProfilePasswordSet = Boolean(
        profile.passwordEncrypted ?? profile.socialIdentity ?? profile.enterpriseSsoIdentity
      );

      if (!isUserPasswordSet && !isProfilePasswordSet) {
        missingProfile.add(MissingProfile.password);
      }
    }

    return missingProfile;
  }

  public async hasMissingExtraProfileFields(profile: InteractionProfile, user?: User) {
    const customProfileFields = await this.queries.customProfileFields.findAllCustomProfileFields();
    const mandatoryCustomProfileFieldNames = customProfileFields
      .filter(({ required }) => required)
      .reduce((accumulator, currentField) => {
        if (currentField.name === 'fullname') {
          return [...accumulator, ...(currentField.config.parts?.map(({ name }) => name) ?? [])];
        }
        return [...accumulator, currentField.name];
      }, new Array<string>());

    for (const name of mandatoryCustomProfileFieldNames) {
      const foundInUser =
        this.hasField(user, name) ||
        this.hasField(user?.profile, name) ||
        this.hasField(user?.customData, name);
      const foundInProfile =
        this.hasField(profile, name) ||
        this.hasField(profile.profile, name) ||
        this.hasField(profile.customData, name);

      if (!foundInUser && !foundInProfile) {
        return true;
      }
    }

    return false;
  }

  /**
   * Parse and split profile data into built-in and custom fields based on the provided keys.
   * @param values The profile data to parse
   * @returns Object containing `name`, `avatar`, `profile` and `customData`
   */
  public validateAndParseCustomProfile(values: Record<string, unknown>): {
    name?: string;
    avatar?: string;
    profile: UserProfile;
    customData: JsonObject;
  } {
    const conflictedReservedBuiltInProfileKeys = Object.keys(
      reservedBuiltInProfileKeyGuard.parse(values)
    );
    assertThat(
      conflictedReservedBuiltInProfileKeys.length === 0,
      new RequestError({
        code: 'custom_profile_fields.name_conflict_built_in_prop',
        name: conflictedReservedBuiltInProfileKeys.join(', '),
      })
    );

    const conflictedSignInIdentifierKeys = Object.keys(signInIdentifierKeyGuard.parse(values));
    assertThat(
      conflictedSignInIdentifierKeys.length === 0,
      new RequestError({
        code: 'custom_profile_fields.name_conflict_sign_in_identifier',
        name: conflictedSignInIdentifierKeys.join(', '),
      })
    );

    const conflictedCustomDataKeys = Object.keys(reservedCustomDataKeyGuard.parse(values));
    assertThat(
      conflictedCustomDataKeys.length === 0,
      new RequestError({
        code: 'custom_profile_fields.name_conflict_custom_data',
        name: conflictedCustomDataKeys.join(', '),
      })
    );

    const { name, avatar } = nameAndAvatarGuard.parse(values);
    const profile = userProfileGuard.parse(values);

    const builtInProfileKeys = new Set<string>(builtInCustomProfileFieldKeys);
    const customData = jsonObjectGuard.parse(
      Object.fromEntries(Object.entries(values).filter(([key]) => !builtInProfileKeys.has(key)))
    );

    return { name, avatar, profile, customData };
  }

  private hasField(object: unknown, field: string): boolean {
    if (!object || typeof object !== 'object') {
      return false;
    }
    return Object.entries(object).some(
      ([key, value]) => key === field && value !== null && value !== undefined
    );
  }
}
