import {
  hookProvisioningProfileGuard,
  type HookProvisioningProfile,
  type JsonObject,
  type User,
} from '@logto/schemas';

export const toHookProvisioningProfile = (user: unknown): HookProvisioningProfile =>
  hookProvisioningProfileGuard.parse(user);

type HookProvisioningProfileWithMergedUserData = Omit<
  HookProvisioningProfile,
  'customData'
> &
  Partial<Pick<User, 'customData'>>;

const hasCustomDataPatch = (customData: JsonObject | undefined): customData is JsonObject =>
  customData !== undefined && Object.keys(customData).length > 0;

export const mergeCustomData = (
  existingData: JsonObject,
  customData?: JsonObject
): JsonObject =>
  hasCustomDataPatch(customData)
    ? {
        ...existingData,
        ...customData,
      }
    : existingData;

export const mergeInlineHookProvisioningProfileUserData = (
  existingUserData: Pick<User, 'customData'>,
  provisioningProfile: HookProvisioningProfile
): HookProvisioningProfileWithMergedUserData => {
  const { customData, ...profile } = provisioningProfile;

  return {
    ...profile,
    ...(hasCustomDataPatch(customData) && {
      customData: mergeCustomData(existingUserData.customData, customData),
    }),
  };
};
