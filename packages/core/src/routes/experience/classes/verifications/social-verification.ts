/* eslint-disable max-lines */
import {
  type ConnectorSession,
  type SocialUserInfo,
  ConnectorType,
  type SocialConnector,
  GoogleConnector,
} from '@logto/connector-kit';
import {
  VerificationType,
  type JsonObject,
  type SocialAuthorizationUrlPayload,
  type User,
  type SocialVerificationRecordData,
  socialVerificationRecordDataGuard,
  type SocialConnectorPayload,
  type EncryptedTokenSet,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import {
  createSocialAuthorizationUrl,
  getConnectorSessionResult,
  verifySocialIdentity,
} from '#src/routes/interaction/utils/social-verification.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { type LogtoConnector } from '#src/utils/connectors/types.js';

import type { InteractionProfile } from '../../types.js';

import { type IdentifierVerificationRecord } from './verification-record.js';

export {
  type SocialVerificationRecordData,
  socialVerificationRecordDataGuard,
} from '@logto/schemas';

type SocialAuthorizationSessionStorageType = 'interactionSession' | 'verificationRecord';

export class SocialVerification implements IdentifierVerificationRecord<VerificationType.Social> {
  /**
   * Factory method to create a new SocialVerification instance
   */
  static create(libraries: Libraries, queries: Queries, connectorId: string) {
    return new SocialVerification(libraries, queries, {
      id: generateStandardId(),
      connectorId,
      type: VerificationType.Social,
    });
  }

  public readonly id: string;
  public readonly type = VerificationType.Social;
  public readonly connectorId: string;
  public socialUserInfo?: SocialUserInfo;
  public encryptedTokenSet?: EncryptedTokenSet;
  public connectorSession: ConnectorSession;
  private connectorDataCache?: LogtoConnector;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: SocialVerificationRecordData
  ) {
    const { id, connectorId, socialUserInfo, encryptedTokenSet, connectorSession } =
      socialVerificationRecordDataGuard.parse(data);

    this.id = id;
    this.connectorId = connectorId;
    this.socialUserInfo = socialUserInfo;
    this.encryptedTokenSet = encryptedTokenSet;
    this.connectorSession = connectorSession ?? {};
  }

  /**
   * Returns true if the social identity has been verified
   */
  get isVerified() {
    return Boolean(this.socialUserInfo);
  }

  /**
   * Create the authorization URL for the social connector and generate a connector authorization session.
   *
   * @param {SocialAuthorizationSessionStorageType} connectorSessionType  - Whether to store the connector session result in the current verification record directly. Set to `true` for the profile API.
   *
   * @remarks
   * For the experience API:
   * This method directly calls the {@link createSocialAuthorizationUrl} method in the interaction/utils/social-verification.ts file.
   * All the intermediate connector session results are stored in the provider's interactionDetails separately, apart from the new verification record.
   * For compatibility reasons, we keep using the old {@link createSocialAuthorizationUrl} method here as a single source of truth.
   * Especially for the SAML connectors,
   * SAML ACS endpoint will find the connector session result by the jti and assign it to the interaction storage.
   * We will need to update the SAML ACS endpoint before move the logic to this new SocialVerification class.
   *
   * For the profile API:
   * This method calls the internal {@link createSocialAuthorizationSession} method to create a social authorization session.
   * The connector session result is stored in the current verification record directly.
   * The social verification flow does not rely on the OIDC interaction context.
   *
   * TODO: Remove the old {@link createSocialAuthorizationUrl} once the old SAML connectors are updated.
   * Align using the new {@link createSocialAuthorizationSession} method for both experience and profile APIs.
   * SAML ACS endpoint will find the verification record by the jti and assign the connector session result to the verification record.
   */
  async createAuthorizationUrl(
    ctx: WithLogContext,
    tenantContext: TenantContext,
    { state, redirectUri }: SocialAuthorizationUrlPayload,
    connectorSessionType: SocialAuthorizationSessionStorageType = 'interactionSession'
  ) {
    // For the profile API, connector session result is stored in the current verification record directly.
    if (connectorSessionType === 'verificationRecord') {
      return this.createSocialAuthorizationSession(ctx, { state, redirectUri });
    }

    // For the experience API, connector session result is stored in the provider's interactionDetails.
    return createSocialAuthorizationUrl(ctx, tenantContext, {
      connectorId: this.connectorId,
      state,
      redirectUri,
    });
  }

  /**
   * Verify the social identity and store the social identity in the verification record.
   *
   * @param {SocialAuthorizationSessionStorageType} connectorSessionType  - Whether to find the connector session result from the current verification record directly. Set to `true` for the profile API.
   *
   * @remarks
   * For the experience API:
   * This method directly calls the {@link verifySocialIdentity} method in the interaction/utils/social-verification.ts file.
   * Fetch the connector session result from the provider's interactionDetails and verify the social identity.
   * For compatibility reasons, we keep using the old {@link verifySocialIdentity} method here as a single source of truth.
   * See the above {@link createAuthorizationUrl} method for more details.
   *
   * For the profile API:
   * This method calls the internal {@link verifySocialIdentityInternally} method to verify the social identity.
   * The connector session result is fetched from the current verification record directly.
   *
   */
  async verify(
    ctx: WithLogContext,
    tenantContext: TenantContext,
    connectorData: JsonObject,
    connectorSessionType: SocialAuthorizationSessionStorageType = 'interactionSession'
  ) {
    // TODO: Remove the dev feature guard once the new social verification flow is fully implemented.
    if (EnvSet.values.isDevFeaturesEnabled) {
      const { userInfo, encryptedTokenSet } = await this.verifySocialIdentity(
        { connectorId: this.connectorId, connectorData },
        ctx,
        tenantContext,
        connectorSessionType
      );

      this.socialUserInfo = userInfo;
      this.encryptedTokenSet = encryptedTokenSet;
      return;
    }

    // TODO: remove this legacy implementation
    const socialUserInfo =
      connectorSessionType === 'verificationRecord'
        ? // For the profile API, find the connector session result from the current verification record directly.
          await this.verifySocialIdentityInternally(connectorData, ctx)
        : // For the experience API, fetch the connector session result from the provider's interactionDetails.
          await verifySocialIdentity(
            { connectorId: this.connectorId, connectorData },
            ctx,
            tenantContext
          );

    this.socialUserInfo = socialUserInfo;
  }

  /**
   * Identify the user by the social identity.
   * If the user is not found, find the related user by the social identity and throw an error.
   */
  async identifyUser(): Promise<User> {
    assertThat(
      this.isVerified,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const user = await this.findUserBySocialIdentity();

    if (!user) {
      const relatedUser = await this.findRelatedUserBySocialIdentity();

      throw new RequestError(
        {
          code: 'user.identity_not_exist',
          status: 404,
        },
        {
          ...(relatedUser && { relatedUser: relatedUser[0] }),
        }
      );
    }

    return user;
  }

  async identifyRelatedUser(): Promise<User> {
    assertThat(
      this.isVerified,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const relatedUser = await this.findRelatedUserBySocialIdentity();

    assertThat(relatedUser, new RequestError({ code: 'user.identity_not_exist', status: 404 }));

    return relatedUser[1];
  }

  /**
   * Returns the social identity as a new user profile.
   */
  async toUserProfile(): Promise<Required<Pick<InteractionProfile, 'socialIdentity'>>> {
    assertThat(
      this.socialUserInfo,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const {
      metadata: { target },
    } = await this.getConnectorData();

    return {
      socialIdentity: {
        target,
        userInfo: this.socialUserInfo,
      },
    };
  }

  /**
   * Returns the synced profile from the social identity.
   *
   * @param isNewUser - Whether the profile is for a new user. Only return the primary email/phone if it is a new user.
   */
  async toSyncedProfile(
    isNewUser = false
  ): Promise<Pick<InteractionProfile, 'avatar' | 'name' | 'primaryEmail' | 'primaryPhone'>> {
    assertThat(
      this.socialUserInfo,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const { name, avatar, email: primaryEmail, phone: primaryPhone } = this.socialUserInfo;

    if (isNewUser) {
      const {
        users: { hasUserWithEmail, hasUserWithNormalizedPhone },
      } = this.queries;

      return {
        // Sync the email only if the email is not used by other users
        ...conditional(primaryEmail && !(await hasUserWithEmail(primaryEmail)) && { primaryEmail }),
        // Sync the phone only if the phone is not used by other users
        ...conditional(
          primaryPhone && !(await hasUserWithNormalizedPhone(primaryPhone)) && { primaryPhone }
        ),
        ...conditional(name && { name }),
        ...conditional(avatar && { avatar }),
      };
    }

    const {
      dbEntry: { syncProfile },
    } = await this.getConnectorData();

    return syncProfile
      ? {
          ...conditional(name && { name }),
          ...conditional(avatar && { avatar }),
        }
      : {};
  }

  toJson(): SocialVerificationRecordData {
    const { id, connectorId, type, socialUserInfo, connectorSession } = this;

    return {
      id,
      connectorId,
      type,
      socialUserInfo,
      connectorSession,
    };
  }

  private async findUserBySocialIdentity(): Promise<User | undefined> {
    const {
      users: { findUserByIdentity },
    } = this.queries;

    if (!this.socialUserInfo) {
      return;
    }

    const {
      metadata: { target },
    } = await this.getConnectorData();

    const user = await findUserByIdentity(target, this.socialUserInfo.id);

    return user ?? undefined;
  }

  /**
   * Find the related user using the social identity's verified email or phone number.
   */
  private async findRelatedUserBySocialIdentity(): ReturnType<
    typeof socials.findSocialRelatedUser
  > {
    const { socials } = this.libraries;

    if (!this.socialUserInfo) {
      return null;
    }

    return socials.findSocialRelatedUser(this.socialUserInfo);
  }

  private async getConnectorData(): Promise<LogtoConnector<SocialConnector>> {
    const { getConnector } = this.libraries.socials;

    this.connectorDataCache ||= await getConnector(this.connectorId);

    assertThat(this.connectorDataCache.type === ConnectorType.Social, 'connector.unexpected_type');

    return this.connectorDataCache;
  }

  /**
   * Internal method to create a social authorization session.
   *
   * @remarks
   * This method is a alternative to the {@link createSocialAuthorizationUrl} method in the interaction/utils/social-verification.ts file.
   * Generate the social authorization URL and store the connector session result in the current verification record directly.
   * This social connector session result will be used to verify the social response later.
   * This method can be used for both experience and profile APIs, w/o OIDC interaction context.
   *
   */
  private async createSocialAuthorizationSession(
    ctx: WithLogContext,
    { state, redirectUri }: SocialAuthorizationUrlPayload
  ) {
    assertThat(state && redirectUri, 'session.insufficient_info');

    const connector = await this.getConnectorData();

    const {
      headers: { 'user-agent': userAgent },
    } = ctx.request;

    return connector.getAuthorizationUri(
      {
        state,
        redirectUri,
        connectorId: this.connectorId,
        connectorFactoryId: connector.metadata.id,
        // Instead of getting the jti from the interaction details, use the current verification record's id as the jti.
        jti: this.id,
        headers: { userAgent },
      },
      async (connectorSession) => {
        // Store the connector session result in the current verification record directly.
        this.connectorSession = connectorSession;
      }
    );
  }

  /**
   * Internal method to verify the social identity.
   *
   * @deprecated
   *
   * @remarks
   * This method is a alternative to the {@link verifySocialIdentity} method in the interaction/utils/social-verification.ts file.
   * Verify the social identity using the connector data received from the client and the connector session stored in the current verification record.
   * This method can be used for both experience and profile APIs, w/o OIDC interaction context.
   */
  private async verifySocialIdentityInternally(connectorData: JsonObject, ctx: WithLogContext) {
    const connector = await this.getConnectorData();
    // Verify the CSRF token if it's a Google connector and has credential (a Google One Tap verification)
    if (
      connector.metadata.id === GoogleConnector.factoryId &&
      connectorData[GoogleConnector.oneTapParams.credential]
    ) {
      const csrfToken = connectorData[GoogleConnector.oneTapParams.csrfToken];
      const value = ctx.cookies.get(GoogleConnector.oneTapParams.csrfToken);
      assertThat(value === csrfToken, 'session.csrf_token_mismatch');
    }

    // Verify the social authorization session exists
    assertThat(this.connectorSession, 'session.connector_validation_session_not_found');

    const socialUserInfo = await this.libraries.socials.getUserInfo(
      this.connectorId,
      connectorData,
      async () => this.connectorSession
    );

    return socialUserInfo;
  }

  /**
   * Verify the social identity
   *
   * @param {SocialAuthorizationSessionStorageType} connectorSessionType - Connector session storage type, default is 'interactionSession'.
   *
   * @remarks
   *
   * - For Experience API: This method uses the connector session result stored in the provider's interactionDetails to verify the social identity.
   * - For Profile/Account API: This method uses the connector session stores in the current verification record directly.
   *
   * @remarks
   * If the connector has token storage enabled and supports token response, this method will return the user info along with the token responses.
   * Otherwise, it will only return the user info.
   */
  private async verifySocialIdentity(
    { connectorId, connectorData }: SocialConnectorPayload,
    ctx: WithLogContext,
    { provider }: TenantContext,
    connectorSessionType: SocialAuthorizationSessionStorageType
  ) {
    const connector = await this.getConnectorData();

    // Verify the CSRF token if it's a Google connector and has credential (a Google One Tap verification)
    if (
      connector.metadata.id === GoogleConnector.factoryId &&
      connectorData[GoogleConnector.oneTapParams.credential]
    ) {
      const csrfToken = connectorData[GoogleConnector.oneTapParams.csrfToken];
      const value = ctx.cookies.get(GoogleConnector.oneTapParams.csrfToken);
      assertThat(value === csrfToken, 'session.csrf_token_mismatch');
    }

    // Get the connector session from the current verification record
    if (connectorSessionType === 'verificationRecord') {
      assertThat(
        this.connectorSession,
        new RequestError({ code: 'session.connector_validation_session_not_found', status: 400 })
      );

      return this.libraries.socials.getUserInfoWithOptionalTokenResponse(
        connectorId,
        connectorData,
        async () => this.connectorSession
      );
    }

    // Get the connector session from the provider's interactionDetails
    return this.libraries.socials.getUserInfoWithOptionalTokenResponse(
      connectorId,
      connectorData,
      async () => getConnectorSessionResult(ctx, provider)
    );
  }
}
/* eslint-enable max-lines */
