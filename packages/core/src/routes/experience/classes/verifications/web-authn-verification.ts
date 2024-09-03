import { type ToZodObject } from '@logto/connector-kit';
import {
  type BindWebAuthn,
  bindWebAuthnGuard,
  type BindWebAuthnPayload,
  MfaFactor,
  VerificationType,
  type WebAuthnRegistrationOptions,
  type WebAuthnVerificationPayload,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { type PublicKeyCredentialRequestOptionsJSON } from 'node_modules/@simplewebauthn/server/esm/deps.js';
import { z } from 'zod';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import {
  generateWebAuthnAuthenticationOptions,
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnAuthentication,
  verifyWebAuthnRegistration,
} from '#src/routes/interaction/utils/webauthn.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type MfaVerificationRecord } from './verification-record.js';

export type WebAuthnVerificationRecordData = {
  id: string;
  type: VerificationType.WebAuthn;
  /** UserId is required for verifying or binding new TOTP */
  userId: string;
  verified: boolean;
  /** The challenge generated for the WebAuthn registration */
  registrationChallenge?: string;
  /** The challenge generated for the WebAuthn authentication */
  authenticationChallenge?: string;
  registrationInfo?: BindWebAuthn;
};

export const webAuthnVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.WebAuthn),
  userId: z.string(),
  verified: z.boolean(),
  registrationChallenge: z.string().optional(),
  authenticationChallenge: z.string().optional(),
  registrationInfo: bindWebAuthnGuard.optional(),
}) satisfies ToZodObject<WebAuthnVerificationRecordData>;

export class WebAuthnVerification implements MfaVerificationRecord<VerificationType.WebAuthn> {
  /**
   * Factory method to create a new WebAuthnVerification instance
   *
   * @param userId The user id is required for generating and verifying WebAuthn options.
   * A WebAuthnVerification instance can only be created if the interaction is identified.
   */
  static create(libraries: Libraries, queries: Queries, userId: string) {
    return new WebAuthnVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.WebAuthn,
      verified: false,
      userId,
    });
  }

  readonly id;
  readonly type = VerificationType.WebAuthn;
  readonly userId;
  private verified;
  private registrationChallenge?: string;
  private authenticationChallenge?: string;
  #registrationInfo?: BindWebAuthn;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: WebAuthnVerificationRecordData
  ) {
    const {
      id,
      userId,
      verified,
      registrationChallenge,
      authenticationChallenge,
      registrationInfo,
    } = webAuthnVerificationRecordDataGuard.parse(data);

    this.id = id;
    this.userId = userId;
    this.verified = verified;
    this.registrationChallenge = registrationChallenge;
    this.authenticationChallenge = authenticationChallenge;
    this.#registrationInfo = registrationInfo;
  }

  get isVerified() {
    return this.verified;
  }

  get registrationInfo() {
    return this.#registrationInfo;
  }

  get isNewBindMfaVerification() {
    return Boolean(this.#registrationInfo ?? this.registrationChallenge);
  }

  /**
   * @remarks
   * This method is used to generate the WebAuthn registration options for the user.
   * The WebAuthn registration options is used to register a new WebAuthn credential for the user.
   *
   * Refers to the {@link generateWebAuthnRegistrationOptions} function in  `interaction/utils/webauthn.ts` file.
   * Keep it as the single source of truth for generating the WebAuthn registration options.
   * TODO: Consider relocating the function under a shared folder
   */
  async generateWebAuthnRegistrationOptions(
    ctx: WithLogContext
  ): Promise<WebAuthnRegistrationOptions> {
    const { hostname } = ctx.URL;
    const user = await this.findUser();

    const registrationOptions = await generateWebAuthnRegistrationOptions({
      user,
      rpId: hostname,
    });

    this.registrationChallenge = registrationOptions.challenge;

    return registrationOptions;
  }

  /**
   * @remarks
   * This method is used to verify the WebAuthn registration for the user.
   * This method will verify the WebAuthn registration response and store the registration information in the instance.
   * Refers to the {@link verifyBindWebAuthn} function in  `interaction/verifications/mfa-payload-verification.ts` file.
   *
   * @throw {RequestError} with status 400, if no pending WebAuthn registration challenge is found.
   * @throw {RequestError} with status 400, if the WebAuthn registration verification failed or the registration information is not found.
   */
  async verifyWebAuthnRegistration(
    ctx: WithLogContext,
    payload: Omit<BindWebAuthnPayload, 'type'>
  ) {
    const { hostname, origin } = ctx.URL;
    const {
      request: {
        headers: { 'user-agent': userAgent = '' },
      },
    } = ctx;

    assertThat(this.registrationChallenge, 'session.mfa.pending_info_not_found');

    const { verified, registrationInfo } = await verifyWebAuthnRegistration(
      payload,
      this.registrationChallenge,
      hostname,
      origin
    );

    assertThat(verified, 'session.mfa.webauthn_verification_failed');
    assertThat(registrationInfo, 'session.mfa.webauthn_verification_failed');

    const { credentialID, credentialPublicKey, counter } = registrationInfo;

    this.verified = true;

    this.#registrationInfo = {
      type: MfaFactor.WebAuthn,
      credentialId: credentialID,
      publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
      counter,
      agent: userAgent,
      transports: [],
    };
  }

  /**
   * @remarks
   * This method is used to generate the WebAuthn authentication options for the user.
   * The WebAuthn authentication options is used to authenticate the user using existing WebAuthn credentials.
   *
   * Refers to the {@link generateWebAuthnAuthenticationOptions} function in  `interaction/utils/webauthn.ts` file.
   * Keep it as the single source of truth for generating the WebAuthn authentication options.
   * TODO: Consider relocating the function under a shared folder
   *
   * @throws {RequestError} with status 400, if no WebAuthn credentials are found for the user.
   */
  async generateWebAuthnAuthenticationOptions(
    ctx: WithLogContext
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const { hostname } = ctx.URL;
    const { mfaVerifications } = await this.findUser();

    const authenticationOptions = await generateWebAuthnAuthenticationOptions({
      mfaVerifications,
      rpId: hostname,
    });

    this.authenticationChallenge = authenticationOptions.challenge;

    return authenticationOptions;
  }

  /**
   * @remarks
   * This method is used to verify the WebAuthn authentication for the user.
   * Refers to the {@link verifyMfaPayloadVerification} function in `interaction/verifications/mfa-payload-verification.ts` file.
   *
   * @throws {RequestError} with status 400, if no pending WebAuthn authentication challenge is found.
   * @throws {RequestError} with status 400, if the WebAuthn authentication verification failed.
   */
  async verifyWebAuthnAuthentication(
    ctx: WithLogContext,
    payload: Omit<WebAuthnVerificationPayload, 'type'>
  ) {
    const { hostname, origin } = ctx.URL;
    const { mfaVerifications } = await this.findUser();

    assertThat(this.authenticationChallenge, 'session.mfa.pending_info_not_found');

    const { result, newCounter } = await verifyWebAuthnAuthentication({
      payload,
      challenge: this.authenticationChallenge,
      rpId: hostname,
      origin,
      mfaVerifications,
    });

    assertThat(result, 'session.mfa.webauthn_verification_failed');

    this.verified = true;

    // Update the counter and last used time
    const { updateUserById } = this.queries.users;
    await updateUserById(this.userId, {
      mfaVerifications: mfaVerifications.map((mfa) => {
        if (mfa.type !== MfaFactor.WebAuthn || mfa.id !== result.id) {
          return mfa;
        }

        return {
          ...mfa,
          lastUsedAt: new Date().toISOString(),
          ...conditional(newCounter !== undefined && { counter: newCounter }),
        };
      }),
    });
  }

  /**
   *
   * @throws {RequestError} with status 400, if the WebAuthn registration information is not found or not verified.
   */
  toBindMfa(): BindWebAuthn {
    assertThat(this.isVerified, 'session.verification_failed');
    assertThat(this.#registrationInfo, 'session.mfa.pending_info_not_found');
    return this.#registrationInfo;
  }

  toJson(): WebAuthnVerificationRecordData {
    const {
      id,
      userId,
      verified,
      type,
      registrationChallenge,
      authenticationChallenge,
      registrationInfo,
    } = this;

    return {
      id,
      type,
      userId,
      verified,
      registrationChallenge,
      authenticationChallenge,
      registrationInfo,
    };
  }

  private async findUser() {
    const { findUserById } = this.queries.users;
    return findUserById(this.userId);
  }
}
