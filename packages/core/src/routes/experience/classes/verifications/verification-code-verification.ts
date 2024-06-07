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

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { findUserByIdentifier } from '../../utils.js';

import { type Verification } from './verification.js';

/**
 * To make the typescript type checking work. A valid TemplateType is required.
 * This is a work around to map the latest interaction event type to old TemplateType.
 *
 * @remark This is a temporary solution until the connector-kit is updated to use the latest interaction event types.
 **/
const eventToTemplateTypeMap: Record<InteractionEvent, TemplateType> = {
  SignIn: TemplateType.SignIn,
  Register: TemplateType.Register,
  ForgotPassword: TemplateType.ForgotPassword,
};
const getTemplateTypeByEvent = (event: InteractionEvent): TemplateType =>
  eventToTemplateTypeMap[event];

export type VerificationCodeVerificationRecordData = {
  id: string;
  type: VerificationType.VerificationCode;
  identifier: VerificationCodeIdentifier;
  /**
   * The interaction event that triggered the verification.
   * This will be used to determine the template type for the verification code.
   * @remark
   * `InteractionEvent.ForgotPassword` triggered verification results can not used as a verification record for other events.
   */
  interactionEvent: InteractionEvent;
  /** The userId of the user that has been verified. Only available after the verification of existing identifier */
  userId?: string;
  verified: boolean;
};

export const verificationCodeVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.VerificationCode),
  identifier: verificationCodeIdentifierGuard,
  interactionEvent: z.nativeEnum(InteractionEvent),
  userId: z.string().optional(),
  verified: z.boolean(),
}) satisfies ToZodObject<VerificationCodeVerificationRecordData>;

/**
 * VerificationCodeVerification is a verification factor the verifies a given identifier by sending a verification code
 * to the user's email or phone number.
 *
 * @remark The verification code is sent to the user's email or phone number and the user is required to enter the code to verify.
 * If the identifier is for a existing user, the userId will be set after the verification.
 */
export class VerificationCodeVerification implements Verification {
  /**
   * Factory method to create a new VerificationCodeVerification record using the given identifier.
   * The sendVerificationCode method will be automatically triggered on the creation of the record.
   */
  static async create(
    libraries: Libraries,
    queries: Queries,
    identifier: VerificationCodeIdentifier,
    interactionEvent: InteractionEvent
  ) {
    const record = new VerificationCodeVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.VerificationCode,
      identifier,
      interactionEvent,
      verified: false,
    });

    await record.sendVerificationCode();

    return record;
  }

  readonly type = VerificationType.VerificationCode;
  public readonly identifier: VerificationCodeIdentifier;
  public readonly id: string;
  private readonly interactionEvent: InteractionEvent;
  private userId?: string;
  private verified: boolean;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: VerificationCodeVerificationRecordData
  ) {
    const { id, identifier, userId, verified, interactionEvent } = data;

    this.id = id;
    this.identifier = identifier;
    this.interactionEvent = interactionEvent;
    this.userId = userId;
    this.verified = verified;
  }

  /** Returns true if a userId is set */
  get isVerified() {
    return this.verified;
  }

  /** Returns the userId if it is set */
  get verifiedUserId() {
    return this.userId;
  }

  /**
   * Verify the `identifier` with the given code
   *
   * @remark The identifier must match the current identifier of the verification record.
   * The code will be verified by checking the passcode record in the DB.
   *
   * `isVerified` will be set to true if the code is verified successfully.
   * A `verifiedUserId` will be set if the `identifier` matches an existing user.
   */
  async verify(identifier: VerificationCodeIdentifier, code?: string) {
    // Throw code not found error is the input identifier is not match with the verification record
    assertThat(identifier === this.identifier, 'verification_code.not_found');

    // Throw code not found error if the code is not provided
    assertThat(code, 'verification_code.not_found');

    const { verifyPasscode } = this.libraries.passcodes;

    await verifyPasscode(
      this.id,
      getTemplateTypeByEvent(this.interactionEvent),
      code,
      this.codeIdentifierPayload
    );

    this.verified = true;

    const user = await findUserByIdentifier(this.queries.users, this.identifier);
    this.userId = user?.id;
  }

  toJson(): VerificationCodeVerificationRecordData {
    return {
      id: this.id,
      type: this.type,
      identifier: this.identifier,
      interactionEvent: this.interactionEvent,
      userId: this.userId,
      verified: this.verified,
    };
  }

  /** Format the `identifier` data for passcode library method use */
  private get codeIdentifierPayload() {
    return this.identifier.type === 'email'
      ? { email: this.identifier.value }
      : { phone: this.identifier.value };
  }

  /**
   * Send the verification code to the current `identifier`
   *
   * @remark Instead of session jti,
   * the verification id is used as `interaction_jti` to uniquely identify the passcode record in DB
   * for the current interaction session.
   */
  private async sendVerificationCode() {
    const { createPasscode, sendPasscode } = this.libraries.passcodes;

    const verificationCode = await createPasscode(
      this.id,
      getTemplateTypeByEvent(this.interactionEvent),
      this.codeIdentifierPayload
    );

    await sendPasscode(verificationCode);
  }
}
