import { GoogleConnector } from '@logto/connector-kit';
import {
  type GoogleOneTapVerificationRecordData,
  googleOneTapVerificationRecordDataGuard,
  type User,
  VerificationType,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type InteractionProfile } from '../../types.js';

import { type IdentifierVerificationRecord } from './verification-record.js';

export {
  type GoogleOneTapVerificationRecordData,
  googleOneTapVerificationRecordDataGuard,
} from '@logto/schemas';

export class GoogleOneTapVerification
  implements IdentifierVerificationRecord<VerificationType.GoogleOneTap>
{
  /** Factory method to create a new `GoogleOneTapVerification` record */
  static create(libraries: Libraries, queries: Queries, connectorId: string) {
    return new GoogleOneTapVerification(libraries, queries, {
      id: generateStandardId(),
      connectorId,
      type: VerificationType.GoogleOneTap,
      verified: false,
    });
  }

  readonly type = VerificationType.GoogleOneTap;
  readonly id: string;
  readonly connectorId: string;
  private credential?: string;
  private verified: boolean;
  private email?: string;
  private googleUserId?: string;
  private name?: string;
  private avatar?: string;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: GoogleOneTapVerificationRecordData
  ) {
    const { id, connectorId, verified, credential, email, googleUserId, name, avatar } =
      googleOneTapVerificationRecordDataGuard.parse(data);

    this.id = id;
    this.connectorId = connectorId;
    this.verified = verified;
    this.credential = credential;
    this.email = email;
    this.googleUserId = googleUserId;
    this.name = name;
    this.avatar = avatar;
  }

  get isVerified() {
    return this.verified;
  }

  get verifiedEmail() {
    return this.email;
  }

  get verifiedGoogleUserId() {
    return this.googleUserId;
  }

  /**
   * Verify the Google One Tap credential (ID token) using Google's public keys
   */
  async verify(credential: string) {
    console.log('[GoogleOneTap] Debug: Starting verification with connectorId:', this.connectorId);
    
    // Get Google connector configuration
    const { getConnector } = this.libraries.socials;
    
    let googleConnector;
    try {
      googleConnector = await getConnector(this.connectorId);
      console.log('[GoogleOneTap] Debug: Successfully retrieved connector:', {
        id: googleConnector.dbEntry.id,
        type: googleConnector.type,
        metadataId: googleConnector.metadata.id,
        target: googleConnector.metadata.target,
      });
    } catch (error) {
      console.error('[GoogleOneTap] Error: Failed to get connector with ID:', this.connectorId, 'Error:', error);
      throw error;
    }

    assertThat(googleConnector, new RequestError({ code: 'connector.not_found', status: 404 }));

    const configResult = GoogleConnector.configGuard.safeParse(googleConnector.dbEntry.config);

    assertThat(
      configResult.success,
      new RequestError({
        code: 'connector.invalid_config',
        status: 400,
        details: configResult.error?.flatten(),
      })
    );

    const { clientId } = configResult.data;

    // Verify the ID token using Google's public keys
    const { payload } = await jwtVerify(
      credential,
      createRemoteJWKSet(new URL(GoogleConnector.jwksUri)),
      {
        issuer: GoogleConnector.issuer,
        audience: clientId,
        clockTolerance: 10,
      }
    ).catch((error) => {
      throw new RequestError({
        code: 'session.google_one_tap.invalid_id_token',
        status: 400,
        details: error,
      });
    });

    const parsedPayload = GoogleConnector.googleIdTokenPayloadGuard.safeParse(payload);
    assertThat(
      parsedPayload.success,
      new RequestError({
        code: 'session.google_one_tap.invalid_id_token',
        status: 400,
        details: parsedPayload.error?.flatten(),
      })
    );

    const { sub: googleUserId, email, email_verified, name, picture } = parsedPayload.data;

    assertThat(
      email && email_verified,
      new RequestError({
        code: 'session.google_one_tap.unverified_email',
        status: 400,
      })
    );

    // Store verification data
    this.credential = credential;
    this.email = email;
    this.googleUserId = googleUserId;
    this.name = name;
    this.avatar = picture;
    this.verified = true;
  }

  /**
   * Identify the user by the verified Google identity
   */
  async identifyUser(): Promise<User> {
    assertThat(
      this.googleUserId,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const { getConnector } = this.libraries.socials;
    const googleConnector = await getConnector(this.connectorId);
    const { target } = googleConnector.metadata;

    const user = await this.queries.users.findUserByIdentity(target, this.googleUserId);

    assertThat(user, new RequestError({ code: 'user.identity_not_exist', status: 404 }));

    return user;
  }

  /**
   * Find user by email for registration flow
   */
  async findUserByEmail(): Promise<User | undefined> {
    assertThat(
      this.verified && this.email,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const user = await this.queries.users.findUserByEmail(this.email);
    return user ?? undefined;
  }

  /**
   * Convert to user profile for registration
   */
  async toUserProfile(): Promise<InteractionProfile> {
    assertThat(
      this.verified && this.email,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const { getConnector } = this.libraries.socials;
    const googleConnector = await getConnector(this.connectorId);
    const { target } = googleConnector.metadata;

    return {
      primaryEmail: this.email,
      ...(this.name && { name: this.name }),
      ...(this.avatar && { avatar: this.avatar }),
      socialIdentity: {
        target,
        userInfo: {
          id: this.googleUserId ?? '',
          email: this.email,
          ...(this.name && { name: this.name }),
          ...(this.avatar && { avatar: this.avatar }),
        },
      },
    };
  }

  /**
   * Returns the synced profile from the Google One Tap identity.
   * Similar to social verification's toSyncedProfile method.
   */
  async toSyncedProfile(
    isNewUser = false
  ): Promise<Pick<InteractionProfile, 'avatar' | 'name' | 'primaryEmail'>> {
    assertThat(
      this.verified && this.email,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const { name, avatar, email: primaryEmail } = this;

    if (isNewUser) {
      const {
        users: { hasUserWithEmail },
      } = this.queries;

      return {
        // Sync the email only if the email is not used by other users
        ...(primaryEmail && !(await hasUserWithEmail(primaryEmail)) && { primaryEmail }),
        ...(name && { name }),
        ...(avatar && { avatar }),
      };
    }

    // For existing users, only sync name and avatar (not email)
    return {
      ...(name && { name }),
      ...(avatar && { avatar }),
    };
  }

  toJson(): GoogleOneTapVerificationRecordData {
    const { id, type, verified, credential, email, googleUserId, name, avatar, connectorId } = this;

    return {
      id,
      type,
      connectorId,
      verified,
      credential,
      email,
      googleUserId,
      name,
      avatar,
    };
  }
}
