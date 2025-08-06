import { type SocialUserInfo, socialUserInfoGuard, type ToZodObject } from '@logto/connector-kit';
import {
  type CreateUser,
  encryptedTokenSetGuard,
  InteractionEvent,
  secretEnterpriseSsoConnectorRelationPayloadGuard,
  secretSocialConnectorRelationPayloadGuard,
  type User,
  Users,
  UserSsoIdentities,
  type UserSsoIdentity,
} from '@logto/schemas';
import type { Provider } from 'oidc-provider';
import { z } from 'zod';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';

import { type WithI18nContext } from '../../middleware/koa-i18next.js';

import {
  mfaDataGuard,
  type SanitizedMfaData,
  type MfaData,
  sanitizedMfaDataGuard,
} from './classes/mfa.js';
import { type EnterpriseSsoConnectorTokenSetSecret } from './classes/verifications/enterprise-sso-verification.js';
import {
  type VerificationRecordData,
  type VerificationRecord,
  type VerificationRecordMap,
  verificationRecordDataGuard,
  publicVerificationRecordDataGuard,
  type SanitizedVerificationRecordData,
} from './classes/verifications/index.js';
import { type SocialConnectorTokenSetSecret } from './classes/verifications/social-verification.js';
import { type WithExperienceInteractionHooksContext } from './middleware/koa-experience-interaction-hooks.js';
import { type WithExperienceInteractionContext } from './middleware/koa-experience-interaction.js';

export type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

export type InteractionProfile = {
  socialIdentity?: {
    target: string;
    userInfo: SocialUserInfo;
  };
  enterpriseSsoIdentity?: Pick<
    UserSsoIdentity,
    'identityId' | 'ssoConnectorId' | 'issuer' | 'detail'
  >;
  /**
   * This is from one-time token verification. User will be automatically added to the specified organizations.
   */
  jitOrganizationIds?: string[];
  // Syncing the existing enterprise SSO identity detail
  syncedEnterpriseSsoIdentity?: Pick<UserSsoIdentity, 'identityId' | 'issuer' | 'detail'>;
  /**
   * Store encrypted token set from a social verification record.  If present, Logto will save this token set in the Secret Vault for future use by the user.
   */
  socialConnectorTokenSetSecret?: SocialConnectorTokenSetSecret;
  /**
   * Store encrypted token set from a enterprise SSO verification record.  If present, Logto will save this token set in the Secret Vault for future use by the user.
   */
  enterpriseSsoConnectorTokenSetSecret?: EnterpriseSsoConnectorTokenSetSecret;
} & Pick<
  CreateUser,
  | 'avatar'
  | 'name'
  | 'username'
  | 'primaryEmail'
  | 'primaryPhone'
  | 'passwordEncrypted'
  | 'passwordEncryptionMethod'
  | 'profile'
  | 'customData'
>;

const interactionProfileGuard = Users.createGuard
  .pick({
    avatar: true,
    name: true,
    username: true,
    primaryEmail: true,
    primaryPhone: true,
    passwordEncrypted: true,
    passwordEncryptionMethod: true,
    profile: true,
    customData: true,
  })
  .extend({
    socialIdentity: z
      .object({
        target: z.string(),
        userInfo: socialUserInfoGuard,
      })
      .optional(),
    enterpriseSsoIdentity: UserSsoIdentities.guard
      .pick({
        identityId: true,
        ssoConnectorId: true,
        issuer: true,
        detail: true,
      })
      .optional(),
    syncedEnterpriseSsoIdentity: UserSsoIdentities.guard
      .pick({
        identityId: true,
        issuer: true,
        detail: true,
      })
      .optional(),
    jitOrganizationIds: z.array(z.string()).optional(),
    socialConnectorTokenSetSecret: z
      .object({
        encryptedTokenSet: encryptedTokenSetGuard,
        socialConnectorRelationPayload: secretSocialConnectorRelationPayloadGuard,
      })
      .optional(),
    enterpriseSsoConnectorTokenSetSecret: z
      .object({
        encryptedTokenSet: encryptedTokenSetGuard,
        enterpriseSsoConnectorRelationPayload: secretEnterpriseSsoConnectorRelationPayloadGuard,
      })
      .optional(),
  }) satisfies ToZodObject<InteractionProfile>;

export type SanitizedInteractionProfile = Omit<
  InteractionProfile,
  | 'passwordEncrypted'
  | 'passwordEncryptionMethod'
  | 'socialConnectorTokenSetSecret'
  | 'enterpriseSsoConnectorTokenSetSecret'
>;

const sanitizedInteractionProfileGuard = interactionProfileGuard.omit({
  passwordEncrypted: true,
  passwordEncryptionMethod: true,
  socialConnectorTokenSetSecret: true,
  enterpriseSsoConnectorTokenSetSecret: true,
}) satisfies ToZodObject<SanitizedInteractionProfile>;

/**
 * The interaction context provides the callback functions to get the user and verification record from the interaction
 */
export type InteractionContext = {
  getInteractionEvent: () => InteractionEvent;
  getIdentifiedUser: () => Promise<User>;
  getVerificationRecordById: (verificationId: string) => VerificationRecord;
  getVerificationRecordByTypeAndId: <K extends keyof VerificationRecordMap>(
    type: K,
    verificationId: string
  ) => VerificationRecordMap[K];
  getCurrentProfile: () => InteractionProfile;
};

export type ExperienceInteractionRouterContext<ContextT extends WithLogContext = WithLogContext> =
  ContextT &
    WithI18nContext &
    WithInteractionDetailsContext &
    WithExperienceInteractionHooksContext &
    WithExperienceInteractionContext;

export type WithHooksAndLogsContext<ContextT extends WithLogContext = WithLogContext> = ContextT &
  WithInteractionDetailsContext &
  WithExperienceInteractionHooksContext;

/**
 * Interaction storage is used to store the interaction data during the interaction process.
 * It is used to pass data between different interaction steps and to store the interaction state.
 * It is stored in the oidc provider interaction session.
 */
export type InteractionStorage = {
  interactionEvent: InteractionEvent;
  userId?: string;
  profile?: InteractionProfile;
  mfa?: MfaData;
  verificationRecords?: VerificationRecordData[];
  captcha?: {
    verified: boolean;
    skipped: boolean;
  };
};

export const interactionStorageGuard = z.object({
  interactionEvent: z.nativeEnum(InteractionEvent),
  userId: z.string().optional(),
  profile: interactionProfileGuard.optional(),
  mfa: mfaDataGuard.optional(),
  verificationRecords: verificationRecordDataGuard.array().optional(),
  captcha: z
    .object({
      verified: z.boolean(),
      skipped: z.boolean(),
    })
    .optional(),
}) satisfies ToZodObject<InteractionStorage>;

export type SanitizedInteractionStorageData = {
  interactionEvent: InteractionEvent;
  userId?: string;
  profile?: SanitizedInteractionProfile;
  verificationRecords?: SanitizedVerificationRecordData[];
  mfa?: SanitizedMfaData;
  captcha?: {
    verified: boolean;
    skipped: boolean;
  };
};

/**
 * Sanitized interaction response type that excludes sensitive information
 * but includes data needed for client-side logic and form pre-population
 */
export const sanitizedInteractionStorageGuard = z.object({
  interactionEvent: z.nativeEnum(InteractionEvent),
  userId: z.string().optional(),
  profile: sanitizedInteractionProfileGuard,
  verificationRecords: publicVerificationRecordDataGuard.array().optional(),
  mfa: sanitizedMfaDataGuard.optional(),
  captcha: z
    .object({
      verified: z.boolean(),
      skipped: z.boolean(),
    })
    .optional(),
}) satisfies ToZodObject<SanitizedInteractionStorageData>;
