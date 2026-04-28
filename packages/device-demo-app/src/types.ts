export type DeviceAuthResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope: string;
};

export type UserInfo = {
  sub: string;
  username?: string;
  email?: string;
};

export type AppState = 'loading' | 'device-code' | 'success' | 'error' | 'expired';

export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- response.json() returns `any`
  const json = await response.json();
  // eslint-disable-next-line no-restricted-syntax -- Generic JSON response parser
  return json as T;
};

export const getStringClaim = (
  claims: Record<string, unknown>,
  key: string
): string | undefined => {
  const value: unknown = claims[key];
  return typeof value === 'string' ? value : undefined;
};
