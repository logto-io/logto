import {
  type InteractionIdentifier,
  type OneTimeTokenContext,
  type SignInIdentifier,
  type User,
  VerificationType,
  type OneTimeTokenVerificationRecordData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type InteractionProfile } from '../../types.js';
import { findUserByIdentifier } from '../utils.js';

import { type IdentifierVerificationRecord } from './verification-record.js';

export {
  type OneTimeTokenVerificationRecordData,
  oneTimeTokenVerificationRecordDataGuard,
} from '@logto/schemas';

export class OneTimeTokenVerification
  implements IdentifierVerificationRecord<VerificationType.OneTimeToken>
{
  /** Factory method to create a new `OneTimeTokenVerification` record using an identifier */
  static create(
    libraries: Libraries,
    queries: Queries,
    identifier: InteractionIdentifier<SignInIdentifier.Email>
  ) {
    return new OneTimeTokenVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.OneTimeToken,
      identifier,
      verified: false,
    });
  }

  readonly type = VerificationType.OneTimeToken;
  readonly id: string;
  readonly identifier: InteractionIdentifier<SignInIdentifier.Email>;
  private context?: OneTimeTokenContext;
  private verified: boolean;

  /**
   * The constructor method is intended to be used internally by the interaction class
   * to instantiate a `VerificationRecord` object from existing `OneTimeTokenVerificationRecordData`.
   * It directly sets the instance properties based on the provided data.
   * For creating a new verification record from context, use the static `create` method instead.
   */
  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: OneTimeTokenVerificationRecordData
  ) {
    const { id, identifier, verified, oneTimeTokenContext } = data;

    this.id = id;
    this.identifier = identifier;
    this.verified = verified;
    this.context = oneTimeTokenContext;
  }

  get isVerified() {
    return this.verified;
  }

  get oneTimeTokenContext() {
    return this.context;
  }

  /**
   * Verifies if the one-time token matches the record in database with the provided email.
   */
  async verify(token: string) {
    const tokenRecord = await this.libraries.oneTimeTokens.verifyOneTimeToken(
      token,
      this.identifier.value
    );
    this.verified = true;
    this.context = tokenRecord.context;
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
        { identifier: this.identifier }
      )
    );

    return user;
  }

  toUserProfile(): InteractionProfile {
    assertThat(
      this.verified,
      new RequestError({
        code: 'session.verification_failed',
        state: 400,
      })
    );

    const { value } = this.identifier;
    const { jitOrganizationIds } = this.context ?? {};

    return { primaryEmail: value, jitOrganizationIds };
  }

  toJson(): OneTimeTokenVerificationRecordData {
    const { id, type, identifier, verified, context } = this;

    return { id, type, identifier, verified, oneTimeTokenContext: context };
  }

  toSanitizedJson(): OneTimeTokenVerificationRecordData {
    return this.toJson();
  }
}
