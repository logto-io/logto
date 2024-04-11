import { LogtoJwtTokenKey, type JwtCustomizerType } from '@logto/schemas';

export const getJwtCustomizerScripts = (jwtCustomizers: Partial<JwtCustomizerType>) => {
  // eslint-disable-next-line no-restricted-syntax -- enable to infer the type using `Object.fromEntries`
  return Object.fromEntries(
    Object.values(LogtoJwtTokenKey).map((key) => [key, jwtCustomizers[key]?.script])
  ) as { [key in LogtoJwtTokenKey]?: string };
};
