import { Truthy } from '@silverhand/essentials';

export const getRoutePrefix = (
  type: 'sign-in' | 'register' | 're-auth',
  method?: 'passwordless' | 'username-password' | 'social'
) => {
  return ['session', type, method]
    .filter((value): value is Truthy<typeof value> => value !== undefined)
    .map((value) => '/' + value)
    .join('');
};
