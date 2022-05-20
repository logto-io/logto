import { KeysToCamelCase } from '@silverhand/essentials';

export type SnakeCaseOidcConfig = {
  authorization_endpoint: string;
  userinfo_endpoint: string;
  token_endpoint: string;
};

export type OidcConfig = KeysToCamelCase<SnakeCaseOidcConfig>;

export enum GrantType {
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token',
}

/**
 * The fixed application ID for Admin Console.
 *
 * This built-in application does not belong to any tenant in the OSS version.
 */
export const adminConsoleApplicationId = 'admin_console';
