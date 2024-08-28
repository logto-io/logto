import { socialUserInfoGuard, type SocialUserInfo, type ToZodObject } from '@logto/connector-kit';
import {
  VerificationType,
  type JsonObject,
  type SocialAuthorizationUrlPayload,
  type User,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import {
  createSocialAuthorizationUrl,
  verifySocialIdentity,
} from '#src/routes/interaction/utils/social-verification.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { type VerificationRecord } from './verification-record.js';

/** The JSON data type for the SocialVerification record stored in the interaction storage */
export type SocialVerificationRecordData = {
  id: string;
  connectorId: string;
  type: VerificationType.Social;
  /**
   * The social identity returned by the connector.
   */
  socialUserInfo?: SocialUserInfo;
  userId?: string;
};

export const socialVerificationRecordDataGuard = z.object({
  id: z.string(),
  connectorId: z.string(),
  type: z.literal(VerificationType.Social),
  socialUserInfo: socialUserInfoGuard.optional(),
  userId: z.string().optional(),
}) satisfies ToZodObject<SocialVerificationRecordData>;

export class SocialVerification implements VerificationRecord<VerificationType.Social> {
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

  /**
   * The userId of the user that has been verified by the social identity.
   * @deprecated will be removed in the coming PR
   */
  public userId?: string;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: SocialVerificationRecordData
  ) {
    const { id, connectorId, socialUserInfo, userId } =
      socialVerificationRecordDataGuard.parse(data);

    this.id = id;
    this.connectorId = connectorId;
    this.socialUserInfo = socialUserInfo;
    this.userId = userId;
  }

  /**
   * Returns true if the social identity has been verified
   */
  get isVerified() {
    return Boolean(this.socialUserInfo);
  }

  get verifiedUserId() {
    return this.userId;
  }

  /**
   * Create the authorization URL for the social connector.
   * Store the connector session result in the provider's interaction storage.
   *
   * @remarks
   * Refers to the {@link createSocialAuthorizationUrl} method in the interaction/utils/social-verification.ts file.
   * Currently, all the intermediate connector session results are stored in the provider's interactionDetails separately,
   * apart from the new verification record.
   * For compatibility reasons, we keep using the old {@link createSocialAuthorizationUrl} method here as a single source of truth.
   * Especially for the SAML connectors,
   * SAML ACS endpoint will find the connector session result by the jti and assign it to the interaction storage.
   * We will need to update the SAML ACS endpoint before move the logic to this new SocialVerification class.
   *
   * TODO: Consider store the connector session result in the verification record directly.
   * SAML ACS endpoint will find the verification record by the jti and assign the connector session result to the verification record.
   */
  async createAuthorizationUrl(
    ctx: WithLogContext,
    tenantContext: TenantContext,
    { state, redirectUri }: SocialAuthorizationUrlPayload
  ) {
    return createSocialAuthorizationUrl(ctx, tenantContext, {
      connectorId: this.connectorId,
      state,
      redirectUri,
    });
  }

  /**
   * Verify the social identity and store the social identity in the verification record.
   *
   * - Store the social identity in the verification record.
   * - Find the user by the social identity and store the userId in the verification record if the user exists.
   *
   * @remarks
   * Refer to the {@link verifySocialIdentity} method in the interaction/utils/social-verification.ts file.
   * For compatibility reasons, we keep using the old {@link verifySocialIdentity} method here as a single source of truth.
   * See the above {@link createAuthorizationUrl} method for more details.
   *
   * TODO: check the log event
   */
  async verify(ctx: WithLogContext, tenantContext: TenantContext, connectorData: JsonObject) {
    const socialUserInfo = await verifySocialIdentity(
      { connectorId: this.connectorId, connectorData },
      ctx,
      tenantContext
    );

    this.socialUserInfo = socialUserInfo;

    const user = await this.findUserBySocialIdentity();
    this.userId = user?.id;
  }

  async findUserBySocialIdentity(): Promise<User | undefined> {
    const { socials } = this.libraries;
    const {
      users: { findUserByIdentity },
    } = this.queries;

    if (!this.socialUserInfo) {
      return;
    }

    const {
      metadata: { target },
    } = await socials.getConnector(this.connectorId);

    const user = await findUserByIdentity(target, this.socialUserInfo.id);

    return user ?? undefined;
  }

  /**
   * Find the related user using the social identity's verified email or phone number.
   */
  async findRelatedUserBySocialIdentity(): ReturnType<typeof socials.findSocialRelatedUser> {
    const { socials } = this.libraries;

    if (!this.socialUserInfo) {
      return null;
    }

    return socials.findSocialRelatedUser(this.socialUserInfo);
  }

  toJson(): SocialVerificationRecordData {
    const { id, connectorId, socialUserInfo, type } = this;

    return {
      id,
      connectorId,
      type,
      socialUserInfo,
    };
  }
}
