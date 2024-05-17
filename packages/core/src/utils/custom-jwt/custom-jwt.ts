import { LogtoJwtTokenKey, type JwtCustomizerType } from '@logto/schemas';

import { type CustomJwtDeployRequestBody } from './types.js';

export const getJwtCustomizerScripts = (jwtCustomizers: Partial<JwtCustomizerType>) => {
  // eslint-disable-next-line no-restricted-syntax -- enable to infer the type using `Object.fromEntries`
  return Object.fromEntries(
    Object.values(LogtoJwtTokenKey).map((key) => [key, { production: jwtCustomizers[key]?.script }])
  ) as CustomJwtDeployRequestBody;
};
