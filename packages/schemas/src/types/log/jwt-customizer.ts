export type Prefix = 'JwtCustomizer';

export const prefix: Prefix = 'JwtCustomizer';

/** The type of a custom JWT scenario. */
export enum Type {
  AccessToken = 'AccessToken',
  ClientCredentials = 'ClientCredentials',
}

export type LogKey = `${Prefix}.${Type.AccessToken | Type.ClientCredentials}`;
