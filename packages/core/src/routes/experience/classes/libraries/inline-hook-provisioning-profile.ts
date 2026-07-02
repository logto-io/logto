import {
  hookProvisioningProfileGuard,
  inlineHookUserDataNamespaceKey,
  type HookProvisioningProfile,
  type InlineHookUserData,
  type JsonObject,
  type User,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type InteractionProfile } from '../../types.js';

export const toHookProvisioningProfile = (user: unknown): HookProvisioningProfile =>
  hookProvisioningProfileGuard.parse(user);

export type InlineHookCreateUserProfile = HookProvisioningProfile &
  Partial<
    Pick<
      InteractionProfile,
      | 'socialIdentity'
      | 'enterpriseSsoIdentity'
      | 'syncedEnterpriseSsoIdentity'
      | 'jitOrganizationIds'
      | 'socialConnectorTokenSetSecret'
      | 'enterpriseSsoConnectorTokenSetSecret'
    >
  >;

type HookProvisioningProfileWithMergedUserData = Omit<
  HookProvisioningProfile,
  'customData' | 'logtoConfig'
> &
  Partial<Pick<User, 'customData' | 'logtoConfig'>>;

const hasInlineHookUserData = (
  data: InlineHookUserData | undefined
): data is Required<InlineHookUserData> => data?.[inlineHookUserDataNamespaceKey] !== undefined;

export const mergeInlineHookUserData = (
  existingData: JsonObject,
  inlineHookData: InlineHookUserData | undefined
): JsonObject =>
  hasInlineHookUserData(inlineHookData)
    ? {
        ...existingData,
        [inlineHookUserDataNamespaceKey]: inlineHookData[inlineHookUserDataNamespaceKey],
      }
    : existingData;

export const mergeInlineHookCreateUserCustomData = (
  existingCustomData: JsonObject | undefined,
  inlineHookCustomData: InlineHookUserData | undefined
): JsonObject | undefined => {
  const customData = mergeInlineHookUserData(existingCustomData ?? {}, inlineHookCustomData);

  return Object.keys(customData).length > 0 ? customData : undefined;
};

export const getProfileIdentifierCollisionPayload = ({
  socialIdentity,
  username,
  primaryEmail,
  primaryPhone,
}: InteractionProfile) => ({
  username,
  primaryEmail,
  primaryPhone,
  ...conditional(
    socialIdentity && {
      identity: {
        target: socialIdentity.target,
        id: socialIdentity.userInfo.id,
      },
    }
  ),
});

export const mergeInlineHookProvisioningProfileUserData = (
  existingUserData: Pick<User, 'customData' | 'logtoConfig'>,
  provisioningProfile: HookProvisioningProfile
): HookProvisioningProfileWithMergedUserData => {
  const { customData, logtoConfig, ...profile } = provisioningProfile;

  return {
    ...profile,
    ...(hasInlineHookUserData(customData) && {
      customData: mergeInlineHookUserData(existingUserData.customData, customData),
    }),
    ...(hasInlineHookUserData(logtoConfig) && {
      logtoConfig: mergeInlineHookUserData(existingUserData.logtoConfig, logtoConfig),
    }),
  };
};
