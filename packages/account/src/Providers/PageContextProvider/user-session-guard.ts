/**
 * Guard that detects user mismatch between the cached SDK tokens and the
 * Account API response. When the OIDC session is terminated and a different
 * user signs in, stale tokens in localStorage may cause the Account Center
 * to display the previous user's data.
 *
 * @returns `true` if the cached token user matches the API response user,
 *          `false` if there is a mismatch (stale session).
 */
export const isSessionUserMatch = async (
  getIdTokenClaims: () => Promise<{ sub: string } | undefined>,
  userInfoId: string
): Promise<boolean> => {
  try {
    const claims = await getIdTokenClaims();
    return claims?.sub === userInfoId;
  } catch {
    // If we can't get claims (e.g., no id token), treat as mismatch
    return false;
  }
};
