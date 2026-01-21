import {
  type BindWebAuthn,
  type BindWebAuthnPayload,
  MfaFactor,
  VerificationType,
  type User,
  type WebAuthnRegistrationOptions,
  type WebAuthnVerificationPayload,
  type WebAuthnVerificationRecordData,
  type SignInWebAuthnVerificationRecordData,
  type SanitizedWebAuthnVerificationRecordData,
  type SanitizedSignInWebAuthnVerificationRecordData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { type PublicKeyCredentialRequestOptionsJSON } from 'node_modules/@simplewebauthn/server/esm/deps.js';

import RequestError from '#src/errors/RequestError/index.js';
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

import {
  type IdentifierVerificationRecord,
  type MfaVerificationRecord,
} from './verification-record.js';

export {
  type WebAuthnVerificationRecordData,
  type SignInWebAuthnVerificationRecordData,
  type SanitizedWebAuthnVerificationRecordData,
  type SanitizedSignInWebAuthnVerificationRecordData,
  sanitizedWebAuthnVerificationRecordDataGuard,
  sanitizedSignInWebAuthnVerificationRecordDataGuard,
} from '@logto/schemas';

abstract class BaseWebAuthnVerification {
  readonly id: string;
  userId?: string;
  verified: boolean;
  registrationChallenge?: string;
  registrationRpId?: string;
  registrationInfo?: BindWebAuthn;
  authenticationChallenge?: string;

  constructor(
    readonly libraries: Libraries,
    readonly queries: Queries,
    data: WebAuthnVerificationRecordData | SignInWebAuthnVerificationRecordData
  ) {
    this.id = data.id;
    this.userId = data.userId;
    this.verified = data.verified;
    this.registrationChallenge = data.registrationChallenge;
    this.registrationRpId = data.registrationRpId;
    this.registrationInfo = data.registrationInfo;
    this.authenticationChallenge = data.authenticationChallenge;
  }

  get isVerified() {
    return this.verified;
  }

  get isNewBindMfaVerification() {
    return Boolean(this.registrationInfo ?? this.registrationChallenge ?? this.registrationRpId);
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
  async generateWebAuthnRegistrationOptions(rpId: string): Promise<WebAuthnRegistrationOptions> {
    const user = await this.findUser();

    const registrationOptions = await generateWebAuthnRegistrationOptions({
      user,
      rpId,
    });

    this.registrationChallenge = registrationOptions.challenge;
    this.registrationRpId = rpId;

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
    const {
      request: {
        headers: { 'user-agent': userAgent = '' },
      },
      origin,
    } = ctx;
    const { webauthnRelatedOrigins } = await this.queries.accountCenters.findDefaultAccountCenter();

    assertThat(
      this.registrationChallenge && this.registrationRpId,
      'session.mfa.pending_info_not_found'
    );

    const { verified, registrationInfo } = await verifyWebAuthnRegistration(
      payload,
      this.registrationChallenge,
      [origin, ...webauthnRelatedOrigins]
    );

    assertThat(verified, 'session.mfa.webauthn_verification_failed');
    assertThat(registrationInfo, 'session.mfa.webauthn_verification_failed');

    const { credentialID, credentialPublicKey, counter } = registrationInfo;

    this.verified = true;

    this.registrationInfo = {
      type: MfaFactor.WebAuthn,
      rpId: this.registrationRpId,
      credentialId: credentialID,
      publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
      counter,
      agent: userAgent,
      transports: [],
    };
  }

  async findUser() {
    assertThat(this.userId, 'session.identifier_not_found');
    const { findUserById } = this.queries.users;
    return findUserById(this.userId);
  }
}

export class WebAuthnVerification
  extends BaseWebAuthnVerification
  implements MfaVerificationRecord<VerificationType.WebAuthn>
{
  /**
   * Factory method to create a new WebAuthnVerification instance
   */
  static create(libraries: Libraries, queries: Queries, userId: string) {
    return new WebAuthnVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.WebAuthn,
      verified: false,
      userId,
    });
  }

  userId: string;
  readonly type = VerificationType.WebAuthn;

  constructor(libraries: Libraries, queries: Queries, data: WebAuthnVerificationRecordData) {
    super(libraries, queries, data);
    this.userId = data.userId;
  }

  /**
   * @remarks
   * This method is used to generate the WebAuthn authentication options for MFA verification.
   * The user must be already identified in the MFA flow.
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
    const { mfaVerifications = [] } = await this.findUser();
    const authenticationOptions = await generateWebAuthnAuthenticationOptions({
      mfaVerifications,
      rpId: hostname,
      // MFA doesn't need discoverable credentials since user is already identified
      allowDiscoverable: false,
    });

    this.authenticationChallenge = authenticationOptions.challenge;

    return authenticationOptions;
  }

  /**
   * @remarks
   * Verify WebAuthn authentication for MFA. The user is already identified.
   *
   * @throws {RequestError} with status 400, if no pending WebAuthn authentication challenge is found.
   * @throws {RequestError} with status 400, if the WebAuthn authentication verification failed.
   */
  async verifyWebAuthnAuthentication(
    ctx: WithLogContext,
    payload: Omit<WebAuthnVerificationPayload, 'type'>
  ) {
    const { hostname: expectedRpId, origin } = ctx.URL;

    assertThat(this.authenticationChallenge, 'session.mfa.pending_info_not_found');

    const user = await this.findUser();
    const { mfaVerifications } = user;

    const { result, newCounter } = await verifyWebAuthnAuthentication({
      payload,
      challenge: this.authenticationChallenge,
      rpId: expectedRpId,
      origin,
      mfaVerifications,
    });

    assertThat(result, 'session.mfa.webauthn_verification_failed');

    this.verified = true;

    await this.queries.users.updateUserById(user.id, {
      mfaVerifications: mfaVerifications.map((mfa) => {
        if (mfa.type !== MfaFactor.WebAuthn || mfa.id !== result.id) {
          return mfa;
        }

        return {
          ...mfa,
          rpId: mfa.rpId ?? expectedRpId,
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
    assertThat(this.registrationInfo, 'session.mfa.pending_info_not_found');
    return this.registrationInfo;
  }

  toJson(): WebAuthnVerificationRecordData {
    return {
      id: this.id,
      type: this.type,
      userId: this.userId,
      verified: this.verified,
      registrationChallenge: this.registrationChallenge,
      authenticationChallenge: this.authenticationChallenge,
      registrationRpId: this.registrationRpId,
      registrationInfo: this.registrationInfo,
    };
  }

  toSanitizedJson(): SanitizedWebAuthnVerificationRecordData {
    const { id, type, userId, verified } = this;
    return { id, type, userId, verified };
  }
}

export class SignInWebAuthnVerification
  extends BaseWebAuthnVerification
  implements IdentifierVerificationRecord<VerificationType.SignInWebAuthn>
{
  /**
   * Factory method to create a new WebAuthnVerification instance
   */
  static create(libraries: Libraries, queries: Queries) {
    return new SignInWebAuthnVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.SignInWebAuthn,
      verified: false,
    });
  }

  readonly type = VerificationType.SignInWebAuthn;
  private readonly authenticationRpId?: string;

  constructor(libraries: Libraries, queries: Queries, data: SignInWebAuthnVerificationRecordData) {
    super(libraries, queries, data);
    this.authenticationRpId = data.authenticationRpId;
  }

  /**
   * @remarks
   * This method is used to verify the WebAuthn authentication for the user who uses passkey sign-in.
   *
   * @throws {RequestError} with status 400, if no pending WebAuthn authentication challenge is found.
   * @throws {RequestError} with status 400, if the WebAuthn authentication verification failed.
   */
  async verifyWebAuthnAuthentication(
    ctx: WithLogContext,
    payload: Omit<WebAuthnVerificationPayload, 'type'>
  ) {
    const { hostname, origin } = ctx.URL;

    assertThat(this.authenticationChallenge, 'session.passkey_sign_in.pending_info_not_found');
    assertThat(this.authenticationRpId === hostname, 'session.passkey_sign_in.conflict_rp_id');

    const { findUserByWebAuthnCredential, updateUserById } = this.queries.users;

    // Find user by credential ID and rpId
    const user = await findUserByWebAuthnCredential(payload.id, this.authenticationRpId);
    assertThat(user, 'session.mfa.webauthn_verification_failed');

    const { id: userId, mfaVerifications } = user;
    const { result, newCounter } = await verifyWebAuthnAuthentication({
      payload,
      challenge: this.authenticationChallenge,
      rpId: hostname,
      origin,
      mfaVerifications,
    });

    assertThat(result, 'session.mfa.webauthn_verification_failed');

    this.verified = true;
    this.userId = userId;

    await updateUserById(userId, {
      mfaVerifications: mfaVerifications.map((mfa) => {
        if (mfa.type !== MfaFactor.WebAuthn || mfa.id !== result.id) {
          return mfa;
        }

        return {
          ...mfa,
          rpId: mfa.rpId ?? hostname,
          lastUsedAt: new Date().toISOString(),
          ...conditional(newCounter !== undefined && { counter: newCounter }),
        };
      }),
    });
  }

  async identifyUser(): Promise<User> {
    assertThat(this.isVerified, 'session.verification_failed');

    const user = await this.findUser();

    assertThat(
      user,
      new RequestError({ code: 'user.user_not_exist', status: 404 }, { identifier: this.userId })
    );

    return user;
  }

  toJson(): SignInWebAuthnVerificationRecordData {
    return {
      id: this.id,
      type: this.type,
      userId: this.userId,
      verified: this.verified,
      registrationChallenge: this.registrationChallenge,
      authenticationChallenge: this.authenticationChallenge,
      registrationRpId: this.registrationRpId,
      authenticationRpId: this.authenticationRpId,
      registrationInfo: this.registrationInfo,
    };
  }

  toSanitizedJson(): SanitizedSignInWebAuthnVerificationRecordData {
    const { id, type, userId, verified } = this;
    return { id, type, userId, verified };
  }
}
