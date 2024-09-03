import { type ToZodObject } from '@logto/connector-kit';
import {
  MfaFactor,
  VerificationType,
  type BindTotp,
  type MfaVerificationTotp,
  type User,
} from '@logto/schemas';
import { generateStandardId, getUserDisplayName } from '@logto/shared';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { z } from 'zod';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import {
  generateTotpSecret,
  validateTotpToken,
} from '#src/routes/interaction/utils/totp-validation.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type MfaVerificationRecord } from './verification-record.js';

const defaultDisplayName = 'Unnamed User';

// Type assertion for the user's TOTP mfa verification settings
const findUserTotp = (
  mfaVerifications: User['mfaVerifications']
): MfaVerificationTotp | undefined =>
  mfaVerifications.find((mfa): mfa is MfaVerificationTotp => mfa.type === MfaFactor.TOTP);

export type TotpVerificationRecordData = {
  id: string;
  type: VerificationType.TOTP;
  /** UserId is required for verifying or binding new TOTP */
  userId: string;
  secret?: string;
  verified: boolean;
};

export const totpVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.TOTP),
  userId: z.string(),
  secret: z.string().optional(),
  verified: z.boolean(),
}) satisfies ToZodObject<TotpVerificationRecordData>;

export class TotpVerification implements MfaVerificationRecord<VerificationType.TOTP> {
  /**
   * Factory method to create a new TotpVerification instance
   *
   * @param userId The user id is required for verifying or binding new TOTP.
   * A TotpVerification instance can only be created if the interaction is identified.
   */
  static create(libraries: Libraries, queries: Queries, userId: string) {
    return new TotpVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.TOTP,
      verified: false,
      userId,
    });
  }

  public readonly id: string;
  public readonly type = VerificationType.TOTP;
  public readonly userId: string;
  private verified: boolean;
  #secret?: string;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: TotpVerificationRecordData
  ) {
    const { id, userId, secret, verified } = totpVerificationRecordDataGuard.parse(data);

    this.id = id;
    this.userId = userId;
    this.#secret = secret;
    this.verified = verified;
  }

  get isVerified() {
    return this.verified;
  }

  get secret() {
    return this.#secret;
  }

  get isNewBindMfaVerification() {
    return Boolean(this.#secret);
  }

  /**
   * Create a new TOTP secret and QR code for the user.
   * The secret will be stored in the instance and can be used for verifying the TOTP.
   *
   * @returns The TOTP secret and QR code as a base64 encoded image.
   */
  async generateNewSecret(ctx: WithLogContext): Promise<{ secret: string; secretQrCode: string }> {
    this.#secret = generateTotpSecret();

    const { hostname } = ctx.URL;
    const secretQrCode = await this.generateSecretQrCode(hostname);

    return {
      secret: this.#secret,
      secretQrCode,
    };
  }

  /**
   * Verify the new created TOTP secret.
   *
   * @throws RequestError with 400, if the TOTP secret is not found in the current record or the code is invalid.
   */
  verifyNewTotpSecret(code: string) {
    assertThat(
      this.#secret && validateTotpToken(this.#secret, code),
      'session.mfa.invalid_totp_code'
    );

    this.verified = true;
  }

  /**
   * Verify the user's existing TOTP secret.
   *
   * @throws RequestError with 400, if the TOTP secret is not found or the code is invalid.
   */
  async verifyUserExistingTotp(code: string) {
    const {
      users: { findUserById, updateUserById },
    } = this.queries;

    const { mfaVerifications } = await findUserById(this.userId);

    // User can only have one TOTP MFA record in the profile
    const totpVerification = findUserTotp(mfaVerifications);

    // Can not found totp verification, this is an invalid request, throw invalid code error anyway for security reason
    assertThat(totpVerification, 'session.mfa.invalid_totp_code');

    assertThat(validateTotpToken(totpVerification.key, code), 'session.mfa.invalid_totp_code');

    this.verified = true;

    // Update last used time
    await updateUserById(this.userId, {
      mfaVerifications: mfaVerifications.map((mfa) => {
        if (mfa.id !== totpVerification.id) {
          return mfa;
        }

        return {
          ...mfa,
          lastUsedAt: new Date().toISOString(),
        };
      }),
    });
  }

  toBindMfa(): BindTotp {
    assertThat(this.isVerified, 'session.verification_failed');
    assertThat(this.secret, 'session.mfa.pending_info_not_found');
    return {
      type: MfaFactor.TOTP,
      secret: this.secret,
    };
  }

  toJson(): TotpVerificationRecordData {
    const { id, type, secret, verified, userId } = this;

    return {
      id,
      type,
      userId,
      secret,
      verified,
    };
  }

  /**
   * The QR code is generated using the secret, request hostname, and user information.
   * The QR code can be used to bind the TOTP secret to the user's authenticator app.
   * The QR code is returned as a base64 encoded image.
   */
  private async generateSecretQrCode(service: string) {
    const { secret, userId } = this;

    const {
      users: { findUserById },
    } = this.queries;

    assertThat(secret, 'session.mfa.pending_info_not_found');

    const { username, primaryEmail, primaryPhone, name } = await findUserById(userId);
    const displayName = getUserDisplayName({ username, primaryEmail, primaryPhone, name });
    const keyUri = authenticator.keyuri(displayName ?? defaultDisplayName, service, secret);

    return qrcode.toDataURL(keyUri);
  }
}
