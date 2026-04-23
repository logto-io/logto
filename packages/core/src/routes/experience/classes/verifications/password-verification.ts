import {
  type VerificationIdentifier,
  VerificationType,
  type User,
  type PasswordVerificationRecordData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { differenceInDays } from 'date-fns';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { findUserByIdentifier } from '../utils.js';

import { type IdentifierVerificationRecord } from './verification-record.js';

export {
  type PasswordVerificationRecordData,
  passwordVerificationRecordDataGuard,
} from '@logto/schemas';

type PasswordExpirationReminder = {
  daysUntilExpiration: number;
};

type PasswordVerifySuccess = {
  kind: 'success';
  user: User;
};

type PasswordVerifyReminder = {
  kind: 'reminder';
  user: User;
  reminder: PasswordExpirationReminder;
};

type PasswordVerifyResult = PasswordVerifySuccess | PasswordVerifyReminder;

export class PasswordVerification
  implements IdentifierVerificationRecord<VerificationType.Password>
{
  /** Factory method to create a new `PasswordVerification` record using an identifier */
  static create(libraries: Libraries, queries: Queries, identifier: VerificationIdentifier) {
    return new PasswordVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.Password,
      identifier,
      verified: false,
    });
  }

  readonly type = VerificationType.Password;
  readonly identifier: VerificationIdentifier;
  readonly id: string;
  private verified: boolean;

  /**
   * The constructor method is intended to be used internally by the interaction class
   * to instantiate a `VerificationRecord` object from existing `PasswordVerificationRecordData`.
   * It directly sets the instance properties based on the provided data.
   * For creating a new verification record from context, use the static `create` method instead.
   */
  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: PasswordVerificationRecordData
  ) {
    const { id, identifier, verified } = data;

    this.id = id;
    this.identifier = identifier;
    this.verified = verified;
  }

  /** Returns true if a userId is set */
  get isVerified() {
    return this.verified;
  }

  /**
   * Verifies the password against the current identifier and evaluates password expiration.
   *
   * Returns:
   * - `kind: 'success'` when the password is valid and outside the reminder window.
   * - `kind: 'reminder'` when the password is valid but close to expiration.
   *
   * @throws RequestError with 400 status if sentinel policy blocks the action (failed too many times).
   * @throws RequestError with 401 status if user id suspended.
   * @throws RequestError with 422 status if the password is already expired.
   * @throws RequestError with 422 status if the user is not found or the password is incorrect.
   */
  async verify(password: string): Promise<PasswordVerifyResult> {
    const user = await findUserByIdentifier(this.queries.users, this.identifier);

    // Throws an 422 error if the user is not found or the password is incorrect
    const verifiedUser = await this.libraries.users.verifyUserPassword(user, password);

    assertThat(
      !verifiedUser.isSuspended,
      new RequestError({ code: 'user.suspended', status: 401 })
    );

    const result = await this.guardPasswordExpiration(verifiedUser);
    this.verified = true;

    return result;
  }

  async identifyUser(): Promise<User> {
    assertThat(
      this.verified,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const user = await findUserByIdentifier(this.queries.users, this.identifier);

    assertThat(
      user,
      new RequestError(
        { code: 'user.user_not_exist', status: 404 },
        {
          identifier: this.identifier.value,
        }
      )
    );

    return user;
  }

  toJson(): PasswordVerificationRecordData {
    const { id, type, identifier, verified } = this;

    return {
      id,
      type,
      identifier,
      verified,
    };
  }

  toSanitizedJson(): PasswordVerificationRecordData {
    return this.toJson();
  }

  /**
   * Checks the password expiration policy after the password has already been verified.
   *
   * This helper keeps the expiration decision close to the password verification logic while
   * leaving the route responsible for persisting the interaction and reacting to reminder state.
   */
  private async guardPasswordExpiration(user: User): Promise<PasswordVerifyResult> {
    const { passwordExpiration } =
      await this.queries.signInExperiences.findDefaultSignInExperience();

    if (!passwordExpiration.enabled) {
      return {
        kind: 'success',
        user,
      };
    }

    assertThat(
      passwordExpiration.validPeriodDays,
      new RequestError({
        code: 'sign_in_experiences.password_expiration_invalid_period_days',
        status: 500,
      })
    );

    const referenceDate = new Date(user.passwordUpdatedAt ?? user.createdAt);
    const passwordAgeInDays = differenceInDays(new Date(), referenceDate);

    const isPasswordExpired =
      user.isPasswordExpired || passwordAgeInDays >= passwordExpiration.validPeriodDays;

    assertThat(!isPasswordExpired, new RequestError({ code: 'password.expired', status: 422 }));

    const reminderPeriodDays = passwordExpiration.reminderPeriodDays ?? 0;
    const reminderDaysUntilExpiration = passwordExpiration.validPeriodDays - passwordAgeInDays;

    const isInReminderWindow =
      reminderPeriodDays > 0 && reminderDaysUntilExpiration <= reminderPeriodDays;

    if (!isInReminderWindow) {
      return {
        kind: 'success',
        user,
      };
    }

    return {
      kind: 'reminder',
      user,
      reminder: {
        daysUntilExpiration: reminderDaysUntilExpiration,
      },
    };
  }
}
