import { Prompt, useLogto } from '@logto/react';
import { useCallback } from 'react';

import { cloudApi } from '@/consts/resources';
import { storageKeys } from '@/consts/storage';
import useRedirectUri from '@/hooks/use-redirect-uri';
import { saveRedirect } from '@/utils/storage';

/**
 * Keep `CloudScope.ManageAccountSelf` out of the way for sessions that were signed in before the
 * Console started requesting the scope.
 *
 * A refresh token cannot extend its own scopes, so such a session can never obtain the scope by
 * refreshing its Cloud API access token; the authorization request has to run again. Clearing the
 * tokens and signing in with `Prompt.Consent` does exactly that, so routes guarded by the scope
 * (account-level pages, invitations) keep working for signed-in users instead of failing with a 403.
 *
 * The re-consent happens at most once per tab session. When the scope is still missing afterwards,
 * the caller is told to continue with the current token, so the user lands on the regular failing
 * request instead of being redirected forever (e.g. an account whose roles do not grant the scope).
 *
 * @returns An async function that checks the current Cloud API access token and takes an optional
 * URL to return to after the re-consent, defaulting to the current URL:
 *
 * - `false` when a re-consent redirect has been started, and the caller should stop.
 * - `true` when the caller should continue with the current token.
 */
const useManageAccountSelfGuard = () => {
  const { clearAllTokens, getAccessTokenClaims, signIn } = useLogto();
  const redirectUri = useRedirectUri();

  return useCallback(
    async (saveTarget?: URL) => {
      const claims = await getAccessTokenClaims(cloudApi.indicator);
      const scopes = claims?.scope?.split(' ') ?? [];

      if (scopes.includes(cloudApi.scopes.ManageAccountSelf)) {
        // The grant is up to date; allow a later re-consent for a future scope change.
        sessionStorage.removeItem(storageKeys.manageAccountSelfReconsentAttempted);
        return true;
      }

      if (sessionStorage.getItem(storageKeys.manageAccountSelfReconsentAttempted)) {
        return true;
      }

      sessionStorage.setItem(storageKeys.manageAccountSelfReconsentAttempted, 'true');
      saveRedirect(saveTarget);
      await clearAllTokens();
      void signIn({ redirectUri: redirectUri.href, prompt: Prompt.Consent });
      return false;
    },
    [clearAllTokens, getAccessTokenClaims, redirectUri.href, signIn]
  );
};

export default useManageAccountSelfGuard;
