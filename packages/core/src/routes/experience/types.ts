import { type SocialUserInfo, socialUserInfoGuard, type ToZodObject } from '@logto/connector-kit';
import {
  type CreateUser,
  type User,
  Users,
  UserSsoIdentities,
  type UserSsoIdentity,
} from '@logto/schemas';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import { type VerificationRecordMap } from './classes/verifications/index.js';

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
} & Pick<
  CreateUser,
  | 'avatar'
  | 'name'
  | 'username'
  | 'primaryEmail'
  | 'primaryPhone'
  | 'passwordEncrypted'
  | 'passwordEncryptionMethod'
>;

export const interactionProfileGuard = Users.createGuard
  .pick({
    avatar: true,
    name: true,
    username: true,
    primaryEmail: true,
    primaryPhone: true,
    passwordEncrypted: true,
    passwordEncryptionMethod: true,
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
  }) satisfies ToZodObject<InteractionProfile>;

/**
 * The interaction context provides the callback functions to get the user and verification record from the interaction
 */
export type InteractionContext = {
  getIdentifiedUser: () => Promise<User>;
  getVerificationRecordByTypeAndId: <K extends keyof VerificationRecordMap>(
    type: K,
    verificationId: string
  ) => VerificationRecordMap[K];
};
