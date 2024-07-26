/**
 * The reserved routes for Logto sign-in experience.
 * Request to these routes will be proxied to the specified sign-in experience URL.
 */
export const LogtoSignInExperienceRoutes = [
  '/sign-in',
  '/register',
  '/single-sign-on',
  '/social/register',
  '/forgot-password',
];

/**
 * Regular expression to match a file asset path.
 * @example
 * ```ts
 * fileAssetPathRegex.test('/path/to/file.png'); // true
 * fileAssetPathRegex.test('/path/to/file'); // false
 * ```
 */
export const fileAssetPathRegex = /^\/(?:[\w-]+\/)*[\w-]+\.[\dA-Za-z]+$/;
