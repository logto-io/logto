import {
  type VerificationIdentifier,
  VerificationType,
  type User,
  type PasswordVerificationRecordData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

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
   * Verifies if the password matches the record in database with the current identifier.
   * `userId` will be set if the password can be verified.
   *
   * @throws RequestError with 400 status if sentinel policy blocks the action (failed too many times).
   * @throws RequestError with 401 status if user id suspended.
   * @throws RequestError with 422 status if the user is not found or the password is incorrect.
   */
  async verify(password: string) {
    const user = await findUserByIdentifier(this.queries.users, this.identifier);

    // Throws an 422 error if the user is not found or the password is incorrect
    const { isSuspended } = await this.libraries.users.verifyUserPassword(user, password);
    assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

    this.verified = true;

    return user;
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
}
