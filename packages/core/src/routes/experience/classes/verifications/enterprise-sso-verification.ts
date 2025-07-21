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
import { conditional } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import {
  getSsoAuthorizationUrl,
  verifySsoIdentity,
} from '#src/routes/interaction/utils/single-sign-on.js';
import { type ExtendedSocialUserInfo } from '#src/sso/types/saml.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { safeParseUnknownJson } from '#src/utils/json.js';

import type { InteractionProfile } from '../../types.js';

import { type IdentifierVerificationRecord } from './verification-record.js';

export {
  type EnterpriseSsoVerificationRecordData,
  type SanitizedEnterpriseSsoVerificationRecordData,
  enterpriseSsoVerificationRecordDataGuard,
  sanitizedEnterpriseSsoVerificationRecordDataGuard,
} from '@logto/schemas';

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

  private connectorDataCache?: SupportedSsoConnector;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: EnterpriseSsoVerificationRecordData
  ) {
    const { id, connectorId, enterpriseSsoUserInfo, encryptedTokenSet, issuer } =
      enterpriseSsoVerificationRecordDataGuard.parse(data);

    this.id = id;
    this.connectorId = connectorId;
    this.enterpriseSsoUserInfo = enterpriseSsoUserInfo;
    this.issuer = issuer;
    this.encryptedTokenSet = encryptedTokenSet;
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
   * @remarks
   * Refers to thr {@link getSsoAuthorizationUrl} function in the interaction/utils/single-sign-on.ts file.
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
    payload: SocialAuthorizationUrlPayload
  ) {
    const connectorData = await this.getConnectorData();
    return getSsoAuthorizationUrl(ctx, tenantContext, connectorData, payload);
  }

  /**
   * Verify the enterprise SSO identity and store the enterprise SSO identity in the verification record.
   *
   * @remarks
   * Refers to the {@link verifySsoIdentity} function in the interaction/utils/single-sign-on.ts file.
   * For compatibility reasons, we keep using the old {@link verifySsoIdentity} method here as a single source of truth.
   * See the above {@link createAuthorizationUrl} method for more details.
   */
  async verify(ctx: WithLogContext, tenantContext: TenantContext, callbackData: JsonObject) {
    const connectorData = await this.getConnectorData();
    const { issuer, userInfo, encryptedTokenSet } = await verifySsoIdentity(
      ctx,
      tenantContext,
      connectorData,
      callbackData
    );

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

    throw new RequestError({ code: 'user.identity_not_exist', status: 404 });
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

    throw new RequestError({ code: 'user.identity_not_exist', status: 404 });
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
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

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
    const { id, type, connectorId, enterpriseSsoUserInfo, encryptedTokenSet, issuer } = this;

    return {
      id,
      type,
      connectorId,
      enterpriseSsoUserInfo,
      encryptedTokenSet,
      issuer,
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
}
