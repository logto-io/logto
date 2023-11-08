/** Scopes that reserved by Logto, which will be added to the auth request automatically. */
export enum ReservedScope {
  OpenId = 'openid',
  OfflineAccess = 'offline_access',
}

/** Resources that reserved by Logto, which cannot be defined by users. */
export enum ReservedResource {
  /**
   * The resource for organization template per RFC 0001.
   *
   * @see {@link https://github.com/logto-io/rfcs | RFC 0001} for more details.
   */
  Organization = 'urn:logto:resource:organizations',
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
   * Scope for user's organizations data per [RFC 0001](https://https://github.com/logto-io/rfcs).
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

/**
 * The prefix of the URN (Uniform Resource Name) for the organization in Logto.
 *
 * @example
 * ```
 * urn:logto:organization:123 // organization with ID 123
 * ```
 * @see {@link https://en.wikipedia.org/wiki/Uniform_Resource_Name | Uniform Resource Name}
 */
export const organizationUrnPrefix = 'urn:logto:organization:';

/**
 * Build the URN (Uniform Resource Name) for the organization in Logto.
 *
 * @param organizationId The ID of the organization.
 * @returns The URN for the organization.
 * @see {@link organizationUrnPrefix} for the prefix of the URN.
 * @example
 * ```ts
 * buildOrganizationUrn('1') // returns 'urn:logto:organization:1'
 * ```
 */
export const buildOrganizationUrn = (organizationId: string): string =>
  `${organizationUrnPrefix}${organizationId}`;

/**
 * Get the organization ID from the URN (Uniform Resource Name) for the organization in Logto.
 *
 * @param urn The URN for the organization. Must start with {@link organizationUrnPrefix}.
 * @returns The ID of the organization.
 * @throws {TypeError} If the URN is invalid.
 * @example
 * ```ts
 * getOrganizationIdFromUrn('1') // throws TypeError
 * getOrganizationIdFromUrn('urn:logto:organization:1') // returns '1'
 * ```
 */
export const getOrganizationIdFromUrn = (urn: string): string => {
  if (!urn.startsWith(organizationUrnPrefix)) {
    throw new TypeError('Invalid organization URN.');
  }

  return urn.slice(organizationUrnPrefix.length);
};
