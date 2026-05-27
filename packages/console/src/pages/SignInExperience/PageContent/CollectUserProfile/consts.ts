export const collectUserProfilePathname = '/sign-in-experience/collect-user-profile';

// TODO: Remove placeholder Console config once Experience and Account Center avatar upload is implemented.
export const avatarBuiltInFieldKey = 'avatar';

const userAvailableBuiltInFieldKeys = Object.freeze([
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
