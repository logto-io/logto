import {
  VerificationType,
  interactionIdentifierGuard,
  type InteractionIdentifier,
} from '@logto/schemas';
import { type ToZodObject } from '@logto/schemas/lib/utils/zod.js';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { findUserByIdentifier } from '../../utils.js';

import { type VerificationRecord } from './verification-record.js';

export type PasswordVerificationRecordData = {
  id: string;
  type: VerificationType.Password;
  identifier: InteractionIdentifier;
  /** The unique identifier of the user that has been verified. */
  userId?: string;
};

export const passwordVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.Password),
  identifier: interactionIdentifierGuard,
  userId: z.string().optional(),
}) satisfies ToZodObject<PasswordVerificationRecordData>;

export class PasswordVerification implements VerificationRecord<VerificationType.Password> {
  /** Factory method to create a new `PasswordVerification` record using an identifier */
  static create(libraries: Libraries, queries: Queries, identifier: InteractionIdentifier) {
    return new PasswordVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.Password,
      identifier,
    });
  }

  readonly type = VerificationType.Password;
  public readonly identifier: InteractionIdentifier;
  public readonly id: string;
  private userId?: string;

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
    const { id, identifier, userId } = data;

    this.id = id;
    this.identifier = identifier;
    this.userId = userId;
  }

  /** Returns true if a userId is set */
  get isVerified() {
    return this.userId !== undefined;
  }

  get verifiedUserId() {
    return this.userId;
  }

  /**
   * Verifies if the password matches the record in database with the current identifier.
   * `userId` will be set if the password can be verified.
   *
   * @throws RequestError with 401 status if user id suspended.
   * @throws RequestError with 422 status if the user is not found or the password is incorrect.
   */
  async verify(password: string) {
    const user = await findUserByIdentifier(this.queries.users, this.identifier);
    const { isSuspended, id } = await this.libraries.users.verifyUserPassword(user, password);

    assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

    this.userId = id;
  }

  toJson(): PasswordVerificationRecordData {
    const { id, type, identifier, userId } = this;

    return {
      id,
      type,
      identifier,
      userId,
    };
  }
}
