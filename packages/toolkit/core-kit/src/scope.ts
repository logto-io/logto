export enum ReservedScope {
  OpenId = 'openid',
  OfflineAccess = 'offline_access',
}

export type UserClaim =
  | 'name'
  | 'picture'
  | 'username'
  | 'email'
  | 'email_verified'
  | 'phone_number'
  | 'phone_number_verified'
  | 'roles'
  | 'organizations'
  | 'custom_data'
  | 'identities';

/**
 * Scopes for ID Token and Userinfo Endpoint.
 */
export enum UserScope {
  /**
   * Scope for basic user info.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Profile = 'profile',
  /**
   * Scope for user email address.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Email = 'email',
  /**
   * Scope for user phone number.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Phone = 'phone',
  /**
   * Scope for user's custom data.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  CustomData = 'custom_data',
  /**
   * Scope for user's social identity details.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Identities = 'identities',
  /**
   * Scope for user's roles.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Roles = 'roles',
  /**
   * Scope for fetching user's organization info, and performing `urn:logto:grant-type:organization_token` grant defined in RFC 0001.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Organizations = 'urn:logto:scope:organizations',
}

/**
 * Mapped claims that ID Token includes.
 */
export const idTokenClaims: Readonly<Record<UserScope, UserClaim[]>> = Object.freeze({
  [UserScope.Profile]: ['name', 'picture', 'username'],
  [UserScope.Email]: ['email', 'email_verified'],
  [UserScope.Phone]: ['phone_number', 'phone_number_verified'],
  [UserScope.Roles]: ['roles'],
  [UserScope.Organizations]: ['organizations'],
  [UserScope.CustomData]: [],
  [UserScope.Identities]: [],
});

/**
 * Additional claims that Userinfo Endpoint returns.
 */
export const userinfoClaims: Readonly<Record<UserScope, UserClaim[]>> = Object.freeze({
  [UserScope.Profile]: [],
  [UserScope.Email]: [],
  [UserScope.Phone]: [],
  [UserScope.Roles]: [],
  [UserScope.Organizations]: [],
  [UserScope.CustomData]: ['custom_data'],
  [UserScope.Identities]: ['identities'],
});

export const userClaims: Readonly<Record<UserScope, UserClaim[]>> = Object.freeze(
  // Hard to infer type directly, use `as` for a workaround.
  // eslint-disable-next-line no-restricted-syntax
  Object.fromEntries(
    Object.values(UserScope).map((current) => [
      current,
      [...idTokenClaims[current], ...userinfoClaims[current]],
    ])
  ) as Record<UserScope, UserClaim[]>
);
