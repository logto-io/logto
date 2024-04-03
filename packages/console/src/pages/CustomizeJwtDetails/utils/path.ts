import { type LogtoJwtTokenKeyType } from '@logto/schemas';

export const getApiPath = (tokenType: LogtoJwtTokenKeyType) =>
  `api/configs/jwt-customizer/${tokenType}`;
