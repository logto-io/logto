import { TemplateType } from '@logto/connector-kit';
import {
  InteractionEvent,
  VerificationType,
  verificationCodeIdentifierGuard,
  type VerificationCodeIdentifier,
} from '@logto/schemas';
import { type ToZodObject } from '@logto/schemas/lib/utils/zod.js';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import { type createPasscodeLibrary } from '#src/libraries/passcode.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { findUserByIdentifier } from '../../utils.js';

import { type VerificationRecord } from './verification-record.js';

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

/** The JSON data type for the CodeVerification record */
export type CodeVerificationRecordData = {
  id: string;
  type: VerificationType.VerificationCode;
  identifier: VerificationCodeIdentifier;
  interactionEvent: InteractionEvent;
  userId?: string;
  verified: boolean;
};

export const codeVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.VerificationCode),
  identifier: verificationCodeIdentifierGuard,
  interactionEvent: z.nativeEnum(InteractionEvent),
  userId: z.string().optional(),
  verified: z.boolean(),
}) satisfies ToZodObject<CodeVerificationRecordData>;

/** This util method convert the interaction identifier to passcode library payload format */
const getPasscodeIdentifierPayload = (
  identifier: VerificationCodeIdentifier
): Parameters<ReturnType<typeof createPasscodeLibrary>['createPasscode']>[2] =>
  identifier.type === 'email' ? { email: identifier.value } : { phone: identifier.value };

/**
 * CodeVerification is a verification type that verifies a given identifier by sending a verification code
 * to the user's email or phone.
 *
 * @remark The verification code is sent to the user's email or phone and the user is required to enter the code to verify.
 * If the identifier is for a existing user, the userId will be set after the verification.
 *
 * To avoid the redundant naming, the `CodeVerification` is used instead of `VerificationCodeVerification`.
 */
export class CodeVerification implements VerificationRecord<VerificationType.VerificationCode> {
  /**
   * Factory method to create a new CodeVerification record using the given identifier.
   * The sendVerificationCode method will be automatically triggered.
   */
  static async create(
    libraries: Libraries,
    queries: Queries,
    identifier: VerificationCodeIdentifier,
    interactionEvent: InteractionEvent
  ) {
    const record = new CodeVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.VerificationCode,
      identifier,
      interactionEvent,
      verified: false,
    });

    await record.sendVerificationCode();

    return record;
  }

  public readonly id: string;
  public readonly type = VerificationType.VerificationCode;
  public readonly identifier: VerificationCodeIdentifier;

  /**
   * The interaction event that triggered the verification.
   * This will be used to determine the template type for the verification code.
   *
   * @remark
   * `InteractionEvent.ForgotPassword` triggered verification results can not used as a verification record for other events.
   */
  private readonly interactionEvent: InteractionEvent;
  /** The userId  will be set after the verification if the identifier matches any existing user's record */
  private userId?: string;
  private verified: boolean;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: CodeVerificationRecordData
  ) {
    const { id, identifier, userId, verified, interactionEvent } = data;

    this.id = id;
    this.identifier = identifier;
    this.interactionEvent = interactionEvent;
    this.userId = userId;
    this.verified = verified;
  }

  /** Returns true if the identifier has been verified by a given code */
  get isVerified() {
    return this.verified;
  }

  /**
   * Returns the userId if it is set
   * @deprecated this will be removed in the upcoming PR
   */
  get verifiedUserId() {
    return this.userId;
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

    // Try to lookup the user by the identifier
    const user = await findUserByIdentifier(this.queries.users, this.identifier);
    this.userId = user?.id;
  }

  toJson(): CodeVerificationRecordData {
    return {
      id: this.id,
      type: this.type,
      identifier: this.identifier,
      interactionEvent: this.interactionEvent,
      userId: this.userId,
      verified: this.verified,
    };
  }

  /**
   * Send the verification code to the current `identifier`
   *
   * @remark Instead of session jti,
   * the verification id is used as `interaction_jti` to uniquely identify the passcode record in DB
   * for the current interaction.
   */
  private async sendVerificationCode() {
    const { createPasscode, sendPasscode } = this.libraries.passcodes;

    const verificationCode = await createPasscode(
      this.id,
      getTemplateTypeByEvent(this.interactionEvent),
      getPasscodeIdentifierPayload(this.identifier)
    );

    await sendPasscode(verificationCode);
  }
}
