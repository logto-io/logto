import { KeysToCamelCase } from '@silverhand/essentials';

export type SnakeCaseOidcConfig = {
  authorization_endpoint: string;
  userinfo_endpoint: string;
  token_endpoint: string;
};

export type OidcConfig = KeysToCamelCase<SnakeCaseOidcConfig>;
