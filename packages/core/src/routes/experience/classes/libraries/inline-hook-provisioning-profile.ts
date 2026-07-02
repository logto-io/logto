import {
  hookProvisioningProfileGuard,
  inlineHookUserDataNamespaceKey,
  type HookProvisioningProfile,
  type InlineHookUserData,
  type JsonObject,
  type User,
} from '@logto/schemas';

export const toHookProvisioningProfile = (user: unknown): HookProvisioningProfile =>
  hookProvisioningProfileGuard.parse(user);

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
