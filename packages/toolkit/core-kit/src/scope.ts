export enum ReservedScope {
  OpenId = 'openid',
  OfflineAccess = 'offline_access',
}

export type UserClaim =
  | 'name'
  | 'picture'
  | 'username'
  | 'role_names'
  | 'email'
  | 'email_verified'
  | 'phone_number'
  | 'phone_number_verified'
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
}

/**
 * Mapped claims that ID Token includes.
 */
export const idTokenClaims: Readonly<Record<UserScope, UserClaim[]>> = Object.freeze({
  [UserScope.Profile]: ['name', 'picture', 'username', 'role_names'],
  [UserScope.Email]: ['email', 'email_verified'],
  [UserScope.Phone]: ['phone_number', 'phone_number_verified'],
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
