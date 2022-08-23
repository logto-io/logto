import { conditionalString } from '@silverhand/essentials';

export const getRoutePrefix = (
  type: 'sign-in' | 'register',
  method?: 'passwordless' | 'username-password' | 'social'
) => {
  return `${type}${conditionalString(method)}`;
};
