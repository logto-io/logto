import { type LogtoJwtTokenKeyType } from '@logto/schemas';

import { type Action } from './type';

export const getApiPath = (tokenType?: LogtoJwtTokenKeyType) => {
  if (!tokenType) {
    return 'api/configs/jwt-customizer';
  }

  return `api/configs/jwt-customizer/${tokenType}`;
};

export const getPagePath = (tokenType?: LogtoJwtTokenKeyType, action?: Action) => {
  if (!tokenType) {
    return '/customize-jwt';
  }

  if (action) {
    return `/customize-jwt/${tokenType}/${action}`;
  }

  // Fallback to the main page
  return `/customize-jwt`;
};
