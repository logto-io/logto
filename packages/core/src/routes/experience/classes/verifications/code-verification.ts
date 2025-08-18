import { TemplateType } from '@logto/connector-kit';
import {
  type InteractionEvent,
  SignInIdentifier,
  VerificationType,
  type User,
  type CodeVerificationType,
  type VerificationCodeIdentifierOf,
  type VerificationCodeIdentifier,
  type CodeVerificationRecordData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import {
  type SendPasscodeContextPayload,
  type createPasscodeLibrary,
} from '#src/libraries/passcode.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { findUserByIdentifier } from '../utils.js';

import { type IdentifierVerificationRecord } from './verification-record.js';

export {
  type CodeVerificationRecordData,
  emailCodeVerificationRecordDataGuard,
  phoneCodeVerificationRecordDataGuard,
} from '@logto/schemas';

const eventToTemplateTypeMap: Record<InteractionEvent, TemplateType> = {
  SignIn: TemplateType.SignIn,
  Register: TemplateType.Register,
  ForgotPassword: TemplateType.ForgotPassword,
};

/**
 * Utility method to convert interaction event to template type.
 **/
export const getTemplateTypeByEvent = (event: InteractionEvent): TemplateType =>
  eventToTemplateTypeMap[event];

/** This util method convert the interaction identifier to passcode library payload format */
const getPasscodeIdentifierPayload = (
  identifier: VerificationCodeIdentifier
): Parameters<ReturnType<typeof createPasscodeLibrary>['createPasscode']>[2] =>
  identifier.type === 'email' ? { email: identifier.value } : { phone: identifier.value };

type CodeVerificationIdentifierMap = {
  [VerificationType.EmailVerificationCode]: { primaryEmail: string };
  [VerificationType.PhoneVerificationCode]: { primaryPhone: string };
  [VerificationType.MfaEmailVerificationCode]: Record<string, unknown>;
  [VerificationType.MfaPhoneVerificationCode]: Record<string, unknown>;
};

/**
 * This is the parent class for `EmailCodeVerification` and `PhoneCodeVerification`. Not publicly exposed.
 */
abstract class CodeVerification<T extends CodeVerificationType>
  implements IdentifierVerificationRecord<T>
{
  public readonly id: string;
  public readonly identifier: VerificationCodeIdentifierOf<T>;

  /**
   * The template type for sending the verification code, the connector will use this to get the correct template.
   */
  public readonly templateType: TemplateType;
  public abstract readonly type: T;
  protected verified: boolean;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: CodeVerificationRecordData<T>
  ) {
    const { id, identifier, verified, templateType } = data;

    this.id = id;
    this.identifier = identifier;
    this.templateType = templateType;
    this.verified = verified;
  }

  /** Returns true if the identifier has been verified by a given code */
  get isVerified() {
    return this.verified;
  }

  /**
   * Send the verification code to the current `identifier`
   *
   * @param {SendPasscodeContextPayload} payload - The extra context information for the verification code template.
   * @remarks
   * Instead of session jti,
   * the verification id is used as `interaction_jti` to uniquely identify the passcode record in DB
   * for the current interaction.
   */
  async sendVerificationCode(payload?: SendPasscodeContextPayload) {
    const { createPasscode, sendPasscode } = this.libraries.passcodes;

    const verificationCode = await createPasscode(
      this.id,
      this.templateType,
      getPasscodeIdentifierPayload(this.identifier)
    );

    await sendPasscode(verificationCode, payload);
  }

  /**
   * Verify the `identifier` with the given code
   *
   * @remarks
   * The identifier and code will be verified in the passcode library.
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
      this.templateType,
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

  toJson(): CodeVerificationRecordData<T> {
    const { id, type, identifier, templateType, verified } = this;

    return {
      id,
      type,
      identifier,
      templateType,
      verified,
    };
  }

  toSanitizedJson(): CodeVerificationRecordData<T> {
    return this.toJson();
  }

  abstract toUserProfile(): CodeVerificationIdentifierMap[T];
}

const basicCodeVerificationRecordDataGuard = z.object({
  id: z.string(),
  templateType: z.nativeEnum(TemplateType),
  verified: z.boolean(),
});

/**
 * A verification code class that verifies a given email identifier.
 *
 * @remarks
 * The verification code is sent to the user's email and the user is required to enter the exact same code to
 * complete the process. If the identifier is for an existing user, the `userId` will be set after the verification.
 */
export class EmailCodeVerification extends CodeVerification<VerificationType.EmailVerificationCode> {
  public readonly type = VerificationType.EmailVerificationCode;

  toUserProfile(): { primaryEmail: string } {
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
 * A verification code class that verifies a given phone identifier.
 *
 * @remarks
 * The verification code will be sent to the user's phone and the user is required to enter the exact same code to
 * complete the process. If the identifier is for an existing user, the `userId` will be set after the verification.
 */
export class PhoneCodeVerification extends CodeVerification<VerificationType.PhoneVerificationCode> {
  public readonly type = VerificationType.PhoneVerificationCode;

  toUserProfile(): { primaryPhone: string } {
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

export class MfaEmailCodeVerification extends CodeVerification<VerificationType.MfaEmailVerificationCode> {
  public readonly type = VerificationType.MfaEmailVerificationCode;

  toUserProfile(): Record<string, unknown> {
    return {};
  }

  get isNewBindMfaVerification(): boolean {
    // This class is only used for MFA verification
    return false;
  }
}

export class MfaPhoneCodeVerification extends CodeVerification<VerificationType.MfaPhoneVerificationCode> {
  public readonly type = VerificationType.MfaPhoneVerificationCode;

  toUserProfile(): Record<string, unknown> {
    return {};
  }

  get isNewBindMfaVerification(): boolean {
    // This class is only used for MFA verification
    return false;
  }
}

/**
 * Factory method to create a new `EmailCodeVerification` / `PhoneCodeVerification` record using the given identifier.
 */
export const createNewCodeVerificationRecord = (
  libraries: Libraries,
  queries: Queries,
  identifier:
    | VerificationCodeIdentifier<SignInIdentifier.Email>
    | VerificationCodeIdentifier<SignInIdentifier.Phone>,
  templateType: TemplateType
) => {
  const { type } = identifier;

  switch (type) {
    case SignInIdentifier.Email: {
      return new EmailCodeVerification(libraries, queries, {
        id: generateStandardId(),
        type: VerificationType.EmailVerificationCode,
        identifier,
        templateType,
        verified: false,
      });
    }
    case SignInIdentifier.Phone: {
      return new PhoneCodeVerification(libraries, queries, {
        id: generateStandardId(),
        type: VerificationType.PhoneVerificationCode,
        identifier,
        templateType,
        verified: false,
      });
    }
  }
};

/**
 * Factory method to create a new `MfaEmailCodeVerification` / `MfaPhoneCodeVerification` record using the given identifier.
 */
export const createNewMfaCodeVerificationRecord = (
  libraries: Libraries,
  queries: Queries,
  identifier:
    | VerificationCodeIdentifier<SignInIdentifier.Email>
    | VerificationCodeIdentifier<SignInIdentifier.Phone>,
  verified = false
): MfaEmailCodeVerification | MfaPhoneCodeVerification => {
  const { type } = identifier;

  switch (type) {
    case SignInIdentifier.Email: {
      return new MfaEmailCodeVerification(libraries, queries, {
        id: generateStandardId(),
        type: VerificationType.MfaEmailVerificationCode,
        identifier,
        // TODO @wangsijie: replace to new template type
        templateType: TemplateType.SignIn,
        verified,
      });
    }
    case SignInIdentifier.Phone: {
      return new MfaPhoneCodeVerification(libraries, queries, {
        id: generateStandardId(),
        type: VerificationType.MfaPhoneVerificationCode,
        identifier,
        // TODO @wangsijie: replace to new template type
        templateType: TemplateType.SignIn,
        verified,
      });
    }
  }
};
