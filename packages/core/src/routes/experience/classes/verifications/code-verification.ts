import { TemplateType } from '@logto/connector-kit';
import {
  InteractionEvent,
  SignInIdentifier,
  VerificationType,
  verificationCodeIdentifierGuard,
  type User,
  type VerificationCodeIdentifier,
  type VerificationCodeSignInIdentifier,
} from '@logto/schemas';
import { type ToZodObject } from '@logto/schemas/lib/utils/zod.js';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type createPasscodeLibrary } from '#src/libraries/passcode.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { findUserByIdentifier } from '../utils.js';

import { type IdentifierVerificationRecord } from './verification-record.js';

const eventToTemplateTypeMap: Record<InteractionEvent, TemplateType> = {
  SignIn: TemplateType.SignIn,
  Register: TemplateType.Register,
  ForgotPassword: TemplateType.ForgotPassword,
};

/**
 * To make the typescript type checking work. A valid TemplateType is required.
 * This is a work around to map the latest interaction event type to old TemplateType.
 *
 * @remark This is a temporary solution until the connector-kit is updated to use the latest interaction event types.
 **/
const getTemplateTypeByEvent = (event: InteractionEvent): TemplateType =>
  eventToTemplateTypeMap[event];

/** This util method convert the interaction identifier to passcode library payload format */
const getPasscodeIdentifierPayload = (
  identifier: VerificationCodeIdentifier
): Parameters<ReturnType<typeof createPasscodeLibrary>['createPasscode']>[2] =>
  identifier.type === 'email' ? { email: identifier.value } : { phone: identifier.value };

/** The JSON data type for the CodeVerification record */
export type CodeVerificationRecordData<
  T extends VerificationCodeSignInIdentifier = VerificationCodeSignInIdentifier,
> = {
  id: string;
  type: VerificationType.VerificationCode;
  identifier: VerificationCodeIdentifier<T>;
  interactionEvent: InteractionEvent;
  verified: boolean;
};
export const codeVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.VerificationCode),
  identifier: verificationCodeIdentifierGuard,
  interactionEvent: z.nativeEnum(InteractionEvent),
  verified: z.boolean(),
}) satisfies ToZodObject<CodeVerificationRecordData>;

/**
 * CodeVerification is a verification type that verifies a given identifier by sending a verification code.
 * This is the parent class for `EmailCodeVerification` and `PhoneCodeVerification`. Not publicly exposed.
 */
class CodeVerification<
  T extends VerificationCodeSignInIdentifier = VerificationCodeSignInIdentifier,
> implements IdentifierVerificationRecord<VerificationType.VerificationCode>
{
  public readonly id: string;
  public readonly type = VerificationType.VerificationCode;
  public readonly identifier: VerificationCodeIdentifier<T>;

  /**
   * The interaction event that triggered the verification.
   * This will be used to determine the template type for the verification code.
   *
   * @remark
   * `InteractionEvent.ForgotPassword` triggered verification results can not used as a verification record for other events.
   */
  public readonly interactionEvent: InteractionEvent;
  protected verified: boolean;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: CodeVerificationRecordData<T>
  ) {
    const { id, identifier, verified, interactionEvent } = data;

    this.id = id;
    this.identifier = identifier;
    this.interactionEvent = interactionEvent;
    this.verified = verified;
  }

  /** Returns true if the identifier has been verified by a given code */
  get isVerified() {
    return this.verified;
  }

  /**
   * Send the verification code to the current `identifier`
   *
   * @remark Instead of session jti,
   * the verification id is used as `interaction_jti` to uniquely identify the passcode record in DB
   * for the current interaction.
   */
  async sendVerificationCode() {
    const { createPasscode, sendPasscode } = this.libraries.passcodes;

    const verificationCode = await createPasscode(
      this.id,
      getTemplateTypeByEvent(this.interactionEvent),
      getPasscodeIdentifierPayload(this.identifier)
    );

    await sendPasscode(verificationCode);
  }

  /**
   * Verify the `identifier` with the given code
   *
   * @remark The identifier and code will be verified in the passcode library.
   * No need to verify the identifier before calling this method.
   *
   * - `isVerified` will be set to true if the code is verified successfully.
   * - `verifiedUserId` will be set if the `identifier` matches any existing user's record.
   */
  async verify(identifier: VerificationCodeIdentifier, code?: string) {
    // Throw code not found error if the code is not provided
    assertThat(code, 'verification_code.not_found');

    const { verifyPasscode } = this.libraries.passcodes;

    await verifyPasscode(
      this.id,
      getTemplateTypeByEvent(this.interactionEvent),
      code,
      getPasscodeIdentifierPayload(identifier)
    );

    this.verified = true;
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

  toUserProfile(): { primaryEmail: string } | { primaryPhone: string } {
    assertThat(
      this.verified,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const { type, value } = this.identifier;

    return type === 'email' ? { primaryEmail: value } : { primaryPhone: value };
  }

  toJson(): CodeVerificationRecordData<T> {
    const { id, type, identifier, interactionEvent, verified } = this;

    return {
      id,
      type,
      identifier,
      interactionEvent,
      verified,
    };
  }
}

/**
 * CodeVerification is a verification type that verifies a given identifier by sending a verification code.
 *
 * @remark The verification code is sent to the user's email the user is required to enter the code to verify.
 * If the identifier is for a existing user, the userId will be set after the verification.
 */
export class EmailCodeVerification extends CodeVerification<SignInIdentifier.Email> {
  override toUserProfile(): { primaryEmail: string } {
    assertThat(
      this.verified,
      new RequestError({
        code: 'session.verification_failed',
        state: 400,
      })
    );

    const { value } = this.identifier;

    return { primaryEmail: value };
  }
}

/**
 * CodeVerification is a verification type that verifies a given identifier by sending a verification code.
 *
 * @remark The verification code is sent to the user's phone the user is required to enter the code to verify.
 * If the identifier is for a existing user, the userId will be set after the verification.
 */
export class PhoneCodeVerification extends CodeVerification<SignInIdentifier.Phone> {
  override toUserProfile(): { primaryPhone: string } {
    assertThat(
      this.verified,
      new RequestError({
        code: 'session.verification_failed',
        state: 400,
      })
    );

    const { value } = this.identifier;

    return { primaryPhone: value };
  }
}

export const assertEmailCodeVerificationData = (
  data: CodeVerificationRecordData
): data is CodeVerificationRecordData<SignInIdentifier.Email> =>
  data.identifier.type === SignInIdentifier.Email;

export const assertPhoneCodeVerificationData = (
  data: CodeVerificationRecordData
): data is CodeVerificationRecordData<SignInIdentifier.Phone> =>
  data.identifier.type === SignInIdentifier.Phone;

/**
 * Factory method to create a new EmailCodeVerification/PhoneCodeVerification record using the given identifier.
 */
export const createNewCodeVerificationRecord = (
  libraries: Libraries,
  queries: Queries,
  identifier:
    | VerificationCodeIdentifier<SignInIdentifier.Email>
    | VerificationCodeIdentifier<SignInIdentifier.Phone>,
  interactionEvent: InteractionEvent
) => {
  const { type } = identifier;

  if (type === SignInIdentifier.Email) {
    return new EmailCodeVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.VerificationCode,
      identifier,
      interactionEvent,
      verified: false,
    });
  }

  return new PhoneCodeVerification(libraries, queries, {
    id: generateStandardId(),
    type: VerificationType.VerificationCode,
    identifier,
    interactionEvent,
    verified: false,
  });
};
