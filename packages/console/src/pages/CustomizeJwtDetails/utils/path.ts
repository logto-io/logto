import { type LogtoJwtTokenPath } from '@logto/schemas';

export const getApiPath = (tokenType: LogtoJwtTokenPath) =>
  `api/configs/jwt-customizer/${tokenType}`;
