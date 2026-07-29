/* eslint-disable max-lines */
import { appInsights } from '@logto/app-insights/node';
import { ConnectorError, type ConnectorSession } from '@logto/connector-kit';
import {
  VerificationType,
  type JsonObject,
  type SocialAuthorizationUrlPayload,
  type SupportedSsoConnector,
  type User,
  type UserSsoIdentity,
  type EnterpriseSsoVerificationRecordData,
  enterpriseSsoVerificationRecordDataGuard,
  type SanitizedEnterpriseSsoVerificationRecordData,
  type EncryptedTokenSet,
  type SecretEnterpriseSsoConnectorRelationPayload,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import {
  getSsoAuthorizationUrl,
  verifySsoIdentity,
} from '#src/libraries/verification-helpers/single-sign-on.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import OidcConnector from '#src/sso/OidcConnector/index.js';
import { ssoConnectorFactories, type SingleSignOnConnectorSession } from '#src/sso/index.js';
import { type ExtendedSocialUserInfo } from '#src/sso/types/saml.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { safeParseUnknownJson } from '#src/utils/json.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';
import { encryptAndSerializeTokenResponse } from '#src/utils/secret-encryption.js';

import type { InteractionProfile } from '../../types.js';

import { type IdentifierVerificationRecord } from './verification-record.js';

export {
  type EnterpriseSsoVerificationRecordData,
  type SanitizedEnterpriseSsoVerificationRecordData,
  enterpriseSsoVerificationRecordDataGuard,
  sanitizedEnterpriseSsoVerificationRecordDataGuard,
} from '@logto/schemas';

type SsoAuthorizationSessionStorageType = 'interactionSession' | 'verificationRecord';

export type EnterpriseSsoConnectorTokenSetSecret = {
  encryptedTokenSet: EncryptedTokenSet;
  enterpriseSsoConnectorRelationPayload: SecretEnterpriseSsoConnectorRelationPayload;
};

export class EnterpriseSsoVerification
  implements IdentifierVerificationRecord<VerificationType.EnterpriseSso>
{
  static create(libraries: Libraries, queries: Queries, connectorId: string) {
    return new EnterpriseSsoVerification(libraries, queries, {
      id: generateStandardId(),
      connectorId,
      type: VerificationType.EnterpriseSso,
    });
  }

  public readonly id: string;
  public readonly type = VerificationType.EnterpriseSso;
  public readonly connectorId: string;
  public enterpriseSsoUserInfo?: ExtendedSocialUserInfo;
  public encryptedTokenSet?: EncryptedTokenSet;
  public issuer?: string;
  public connectorSession: ConnectorSession;

  private connectorDataCache?: SupportedSsoConnector;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: EnterpriseSsoVerificationRecordData
  ) {
    const { id, connectorId, enterpriseSsoUserInfo, encryptedTokenSet, issuer, connectorSession } =
      enterpriseSsoVerificationRecordDataGuard.parse(data);

    this.id = id;
    this.connectorId = connectorId;
    this.enterpriseSsoUserInfo = enterpriseSsoUserInfo;
    this.issuer = issuer;
    this.encryptedTokenSet = encryptedTokenSet;
    this.connectorSession = connectorSession ?? {};
  }

  /** Returns true if the enterprise SSO identity has been verified */
  get isVerified() {
    return Boolean(this.enterpriseSsoUserInfo && this.issuer);
  }

  async getConnectorData() {
    this.connectorDataCache ||= await this.libraries.ssoConnectors.getSsoConnectorById(
      this.connectorId
    );

    return this.connectorDataCache;
  }

  /**
   * Create the authorization URL for the enterprise SSO connector.
   *
   * @param {SsoAuthorizationSessionStorageType} connectorSessionType - Whether to store the connector
   * session result in the current verification record directly. Set to `'verificationRecord'` for
   * flows (e.g. profile API) that do not rely on the OIDC interaction context.
   *
   * @remarks
   * Refers to the {@link getSsoAuthorizationUrl} function in the libraries/verification-helpers/single-sign-on.ts file.
   * Currently, all the intermediate connector session results are stored in the provider's interactionDetails separately,
   * apart from the new verification record.
   * For compatibility reasons, we keep using the old {@link getSsoAuthorizationUrl} method here as a single source of truth.
   * Especially for the SAML connectors,
   * SAML ACS endpoint will find the connector session result by the jti and assign it to the interaction storage.
   * We will need to update the SAML ACS endpoint before move the logic to this new EnterpriseSsoVerification class.
   */
  async createAuthorizationUrl(
    ctx: WithLogContext,
    tenantContext: TenantContext,
    payload: SocialAuthorizationUrlPayload,
    connectorSessionType: SsoAuthorizationSessionStorageType = 'interactionSession'
  ) {
    if (connectorSessionType === 'verificationRecord') {
      return this.createSocialAuthorizationSession(ctx, tenantContext, payload);
    }

    const connectorData = await this.getConnectorData();
    return getSsoAuthorizationUrl(ctx, tenantContext, connectorData, payload);
  }

  /**
   * Verify the enterprise SSO identity and store the enterprise SSO identity in the verification record.
   *
   * @param {SsoAuthorizationSessionStorageType} connectorSessionType - Whether to find the connector
   * session result from the current verification record directly. Set to `'verificationRecord'` for
   * flows (e.g. profile API) that do not rely on the OIDC interaction context.
   *
   * @remarks
   * Refers to the {@link verifySsoIdentity} function in the libraries/verification-helpers/single-sign-on.ts file.
   * For compatibility reasons, we keep using the old {@link verifySsoIdentity} method here as a single source of truth.
   * See the above {@link createAuthorizationUrl} method for more details.
   */
  async verify(
    ctx: WithLogContext,
    tenantContext: TenantContext,
    callbackData: JsonObject,
    connectorSessionType: SsoAuthorizationSessionStorageType = 'interactionSession'
  ) {
    const connectorData = await this.getConnectorData();

    const { issuer, userInfo, encryptedTokenSet } =
      connectorSessionType === 'verificationRecord'
        ? await this.verifySsoIdentityFromRecord(ctx, tenantContext, connectorData, callbackData)
        : await verifySsoIdentity(ctx, tenantContext, connectorData, callbackData);

    this.issuer = issuer;
    this.enterpriseSsoUserInfo = userInfo;
    this.encryptedTokenSet = encryptedTokenSet;
  }

  /**
   * Identify the user by the enterprise SSO identity and sync the user SSO identity.
   */
  async identifyUser(): Promise<User> {
    assertThat(
      this.isVerified,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const userSsoIdentityResult = await this.findUserSsoIdentityByEnterpriseSsoUserInfo();

    if (userSsoIdentityResult) {
      return userSsoIdentityResult.user;
    }

    throw new RequestError({ code: 'user.sso_identity_not_exist', status: 404 });
  }

  async identifyRelatedUser(): Promise<User> {
    assertThat(
      this.isVerified,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const relatedUser = await this.findRelatedUserSsoIdentity();

    if (relatedUser) {
      return relatedUser;
    }

    throw new RequestError({ code: 'user.sso_identity_not_exist', status: 404 });
  }

  /**
   * Returns the user SSO identity as a new user profile.
   */
  toUserProfile(): Required<Pick<InteractionProfile, 'enterpriseSsoIdentity'>> {
    assertThat(
      this.enterpriseSsoUserInfo && this.issuer,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    return {
      enterpriseSsoIdentity: {
        issuer: this.issuer,
        ssoConnectorId: this.connectorId,
        identityId: this.enterpriseSsoUserInfo.id,
        detail: safeParseUnknownJson(this.enterpriseSsoUserInfo),
      },
    };
  }

  /**
   * Returns the synced profile from the enterprise SSO identity.
   *
   * @param isNewUser - Whether the returned profile is for a new user. Only return the primary email if it is a new user.
   */
  async toSyncedProfile(
    isNewUser = false
  ): Promise<Pick<InteractionProfile, 'avatar' | 'name' | 'primaryEmail'>> {
    assertThat(
      this.enterpriseSsoUserInfo && this.issuer,
      new RequestError({ code: 'session.verification_failed', status: 400 })
    );

    const { name, avatar, email: primaryEmail } = this.enterpriseSsoUserInfo;

    if (isNewUser) {
      return {
        ...conditional(primaryEmail && { primaryEmail }),
        ...conditional(name && { name }),
        ...conditional(avatar && { avatar }),
      };
    }

    const { syncProfile } = await this.getConnectorData();

    return syncProfile
      ? {
          ...conditional(name && { name }),
          ...conditional(avatar && { avatar }),
        }
      : {};
  }

  getTokenSetSecret(): EnterpriseSsoConnectorTokenSetSecret | undefined {
    // Not verified or token set not found
    if (!this.enterpriseSsoUserInfo || !this.issuer || !this.encryptedTokenSet) {
      return;
    }

    return {
      encryptedTokenSet: this.encryptedTokenSet,
      enterpriseSsoConnectorRelationPayload: {
        ssoConnectorId: this.connectorId,
        issuer: this.issuer,
        identityId: this.enterpriseSsoUserInfo.id,
      },
    };
  }

  toJson(): EnterpriseSsoVerificationRecordData {
    const {
      id,
      type,
      connectorId,
      enterpriseSsoUserInfo,
      encryptedTokenSet,
      issuer,
      connectorSession,
    } = this;

    return {
      id,
      type,
      connectorId,
      enterpriseSsoUserInfo,
      encryptedTokenSet,
      issuer,
      connectorSession,
    };
  }

  toSanitizedJson(): SanitizedEnterpriseSsoVerificationRecordData {
    const { id, type, connectorId, enterpriseSsoUserInfo, issuer } = this;

    return { id, type, connectorId, enterpriseSsoUserInfo, issuer };
  }

  private async findUserSsoIdentityByEnterpriseSsoUserInfo(): Promise<
    | {
        user: User;
        userSsoIdentity: UserSsoIdentity;
      }
    | undefined
  > {
    const { userSsoIdentities: userSsoIdentitiesQueries, users: usersQueries } = this.queries;

    if (!this.issuer || !this.enterpriseSsoUserInfo) {
      return;
    }

    const userSsoIdentity = await userSsoIdentitiesQueries.findUserSsoIdentityBySsoIdentityId(
      this.issuer,
      this.enterpriseSsoUserInfo.id
    );

    if (userSsoIdentity) {
      const user = await usersQueries.findUserById(userSsoIdentity.userId);
      return {
        user,
        userSsoIdentity,
      };
    }
  }

  /**
   * Find the related user by the enterprise SSO identity's verified email.
   */
  private async findRelatedUserSsoIdentity(): Promise<User | undefined> {
    const { users: usersQueries } = this.queries;

    if (!this.enterpriseSsoUserInfo?.email) {
      return;
    }

    const user = await usersQueries.findUserByEmail(this.enterpriseSsoUserInfo.email);

    return user ?? undefined;
  }

  /**
   * Internal method to create a social authorization session for enterprise SSO.
   *
   * @remarks
   * This method is an alternative to the {@link getSsoAuthorizationUrl} function in the
   * libraries/verification-helpers/single-sign-on.ts file.
   * Generate the SSO authorization URL and store the connector session result in the current
   * verification record directly, without relying on the OIDC interaction context.
   * This connector session result will be used to verify the SSO response later.
   */
  private async createSocialAuthorizationSession(
    ctx: WithLogContext,
    { envSet }: TenantContext,
    { state, redirectUri }: SocialAuthorizationUrlPayload
  ) {
    assertThat(state && redirectUri, 'session.insufficient_info');

    const connectorData = await this.getConnectorData();
    const { providerName } = connectorData;

    const connectorInstance = new ssoConnectorFactories[providerName].constructor(
      connectorData,
      envSet.endpoint
    );

    return connectorInstance.getAuthorizationUrl(
      {
        jti: this.id,
        state,
        redirectUri,
        connectorId: this.connectorId,
      },
      async (connectorSession: SingleSignOnConnectorSession) => {
        this.connectorSession = connectorSession;
      }
    );
  }

  /**
   * Verify the SSO identity using the connector session stored in this verification record.
   *
   * @remarks
   * Mirrors the {@link verifySsoIdentity} library function but reads the connector session from
   * `this.connectorSession` instead of from the OIDC interaction provider.
   * This is used for flows (e.g. profile API) that do not rely on the OIDC interaction context.
   */
  private async verifySsoIdentityFromRecord(
    ctx: WithLogContext,
    { envSet }: TenantContext,
    connectorData: SupportedSsoConnector,
    data: JsonObject
  ): Promise<{
    issuer: string;
    userInfo: ExtendedSocialUserInfo;
    encryptedTokenSet?: EncryptedTokenSet;
  }> {
    const { id: connectorId, providerName } = connectorData;

    const log = ctx.createLog('Interaction.SignIn.Identifier.SingleSignOn.Submit');
    log.append({ connectorId, data });

    assertThat(
      this.connectorSession,
      new RequestError({ code: 'session.connector_validation_session_not_found', status: 400 })
    );

    try {
      const connectorInstance = new ssoConnectorFactories[providerName].constructor(
        connectorData,
        envSet.endpoint
      );

      const { enableTokenStorage } = connectorData;
      const issuer = await connectorInstance.getIssuer();

      if (connectorInstance instanceof OidcConnector) {
        const { userInfo, tokenResponse } = await connectorInstance.getUserInfo(
          // eslint-disable-next-line no-restricted-syntax -- ConnectorSession (catchall) is runtime-compatible with SingleSignOnConnectorSession
          this.connectorSession as unknown as SingleSignOnConnectorSession,
          data
        );

        log.append({ issuer, userInfo });

        return {
          issuer,
          userInfo,
          encryptedTokenSet: conditional(
            enableTokenStorage &&
              tokenResponse?.access_token &&
              trySafe(
                () => encryptAndSerializeTokenResponse(tokenResponse),
                (error) => {
                  void appInsights.trackException(error, buildAppInsightsTelemetry(ctx));
                }
              )
          ),
        };
      }

      const { userInfo } = await connectorInstance.getUserInfo(
        // eslint-disable-next-line no-restricted-syntax -- ConnectorSession (catchall) is runtime-compatible with SingleSignOnConnectorSession
        this.connectorSession as unknown as SingleSignOnConnectorSession
      );

      return {
        issuer,
        userInfo,
      };
    } catch (error: unknown) {
      if (error instanceof ConnectorError) {
        throw new RequestError({ code: `connector.${error.code}`, status: 500 }, error.data);
      }
      throw error;
    }
  }
}
/* eslint-enable max-lines */
