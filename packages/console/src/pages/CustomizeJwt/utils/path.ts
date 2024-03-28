import { type LogtoJwtTokenPath } from '@logto/schemas';

export const getApiPath = (tokenType: LogtoJwtTokenPath) =>
  `api/configs/jwt-customizer/${tokenType}`;

export const getPagePath = (tokenType?: LogtoJwtTokenPath, action?: 'create' | 'edit') => {
  if (!tokenType) {
    return '/customize-jwt';
  }

  if (action) {
    return `/customize-jwt/${tokenType}/${action}`;
  }

  // Fallback to the main page
  return `/customize-jwt`;
};
