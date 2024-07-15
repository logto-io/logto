import { type SocialUserInfo, socialUserInfoGuard, type ToZodObject } from '@logto/connector-kit';
import { type CreateUser, Users, UserSsoIdentities, type UserSsoIdentity } from '@logto/schemas';
import type Provider from 'oidc-provider';
import { z } from 'zod';

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
