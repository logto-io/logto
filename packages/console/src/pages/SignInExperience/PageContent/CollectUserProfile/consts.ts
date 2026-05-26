export const collectUserProfilePathname = '/sign-in-experience/collect-user-profile';

export const avatarBuiltInFieldKey = 'avatar' as const;

export const userAvailableBuiltInFieldKeys = Object.freeze([
  'name',
  'fullname',
  'nickname',
  'birthdate',
  'gender',
  'profile',
  'website',
  'address',
] as const);

export const getUserAvailableBuiltInFieldKeys = (includeAvatar: boolean) =>
  includeAvatar
    ? [...userAvailableBuiltInFieldKeys, avatarBuiltInFieldKey]
    : [...userAvailableBuiltInFieldKeys];
