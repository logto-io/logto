import { type ToZodObject } from '@logto/connector-kit';
import {
  type InteractionIdentifier,
  interactionIdentifierGuard,
  UsersPasswordEncryptionMethod,
  VerificationType,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { PasswordValidator } from '../libraries/password-validator.js';
import { ProfileValidator } from '../libraries/profile-validator.js';
import { SignInExperienceValidator } from '../libraries/sign-in-experience-validator.js';
import { interactionIdentifierToUserProfile } from '../utils.js';

import { type VerificationRecord } from './verification-record.js';

export type NewPasswordIdentityVerificationRecordData = {
  id: string;
  type: VerificationType.NewPasswordIdentity;
  /**
   * For now we only support username identifier for new password identity registration.
   * For email and phone new identity registration, a `CodeVerification` record is required.
   */
  identifier: InteractionIdentifier;
  passwordEncrypted?: string;
  passwordEncryptionMethod?: UsersPasswordEncryptionMethod.Argon2i;
};

export const newPasswordIdentityVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.NewPasswordIdentity),
  identifier: interactionIdentifierGuard,
  passwordEncrypted: z.string().optional(),
  passwordEncryptionMethod: z.literal(UsersPasswordEncryptionMethod.Argon2i).optional(),
}) satisfies ToZodObject<NewPasswordIdentityVerificationRecordData>;

/**
 * NewPasswordIdentityVerification class is used for creating a new user using password + identifier.
 *
 * @remarks This verification record can only be used for new user registration.
 * By default this verification record allows all types of identifiers, username, email, and phone.
 * For email and phone identifiers, a `CodeVerification` record is required.
 */
export class NewPasswordIdentityVerification
  implements VerificationRecord<VerificationType.NewPasswordIdentity>
{
  /** Factory method to create a new `NewPasswordIdentityVerification` record using an identifier */
  static create(libraries: Libraries, queries: Queries, identifier: InteractionIdentifier) {
    return new NewPasswordIdentityVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.NewPasswordIdentity,
      identifier,
    });
  }

  readonly type = VerificationType.NewPasswordIdentity;
  readonly id: string;
  readonly identifier: InteractionIdentifier;

  private passwordEncrypted?: string;
  private passwordEncryptionMethod?: UsersPasswordEncryptionMethod.Argon2i;

  private readonly profileValidator: ProfileValidator;
  private readonly signInExperienceValidator: SignInExperienceValidator;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: NewPasswordIdentityVerificationRecordData
  ) {
    const { id, identifier, passwordEncrypted, passwordEncryptionMethod } = data;

    this.id = id;
    this.identifier = identifier;
    this.passwordEncrypted = passwordEncrypted;
    this.passwordEncryptionMethod = passwordEncryptionMethod;
    this.profileValidator = new ProfileValidator(queries);
    this.signInExperienceValidator = new SignInExperienceValidator(libraries, queries);
  }

  get isVerified() {
    return Boolean(this.passwordEncrypted) && Boolean(this.passwordEncryptionMethod);
  }

  /**
   * Verify the new password identity
   *
   * - Check if the identifier is unique across users
   * - Validate the password against the password policy
   *
   * @throws {RequestError} with status 422 if the identifier is in use by another user
   * @throws {RequestError} with status 422 if the password does not meet the password policy
   */
  async verify(password: string) {
    const { identifier } = this;
    const identifierProfile = interactionIdentifierToUserProfile(identifier);
    await this.profileValidator.guardProfileUniquenessAcrossUsers(identifierProfile);

    const passwordPolicy = await this.signInExperienceValidator.getPasswordPolicy();
    const passwordValidator = new PasswordValidator(passwordPolicy);
    await passwordValidator.validatePassword(password, identifierProfile);

    const { passwordEncrypted, passwordEncryptionMethod } =
      await passwordValidator.createPasswordDigest(password);

    this.passwordEncrypted = passwordEncrypted;
    this.passwordEncryptionMethod = passwordEncryptionMethod;
  }

  toUserProfile() {
    assertThat(
      this.passwordEncrypted && this.passwordEncryptionMethod,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const { identifier, passwordEncrypted, passwordEncryptionMethod } = this;

    const identifierProfile = interactionIdentifierToUserProfile(identifier);

    return {
      ...identifierProfile,
      passwordEncrypted,
      passwordEncryptionMethod,
    };
  }

  toJson(): NewPasswordIdentityVerificationRecordData {
    const { id, type, identifier, passwordEncrypted, passwordEncryptionMethod } = this;

    return {
      id,
      type,
      identifier,
      passwordEncrypted,
      passwordEncryptionMethod,
    };
  }
}
