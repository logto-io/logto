import { type LogtoJwtTokenPath } from '@logto/schemas';

import { type Action } from './type';

export const getApiPath = (tokenType: LogtoJwtTokenPath) =>
  `api/configs/jwt-customizer/${tokenType}`;

export const getPagePath = (tokenType?: LogtoJwtTokenPath, action?: Action) => {
  if (!tokenType) {
    return '/customize-jwt';
  }

  if (action) {
    return `/customize-jwt/${tokenType}/${action}`;
  }

  // Fallback to the main page
  return `/customize-jwt`;
};
