import { Prompt, useLogto } from '@logto/react';
import { ExtraParamsKey } from '@logto/schemas';
import { useContext, useEffect } from 'react';

import PageContext from './Providers/PageContextProvider/PageContext';
import { accountCenterBasePath, getUiLocales, setRouteRestore } from './utils/account-center-route';

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

type UseAuthRedirectProps = {
  readonly isInCallback: boolean;
  readonly isSilentAuthFailed: boolean;
};

/**
 * Drives Account Center's auth redirect lifecycle:
 *
 * - Unauthenticated landing → kick off a normal sign-in.
 * - `userInfoError` while authenticated → try a silent OIDC re-auth (`Prompt.None`)
 *   so a user with a valid session cookie (e.g. the User B side of a user-switch
 *   with stale local tokens) is recovered without an interactive login.
 * - The OIDC provider answering `error=login_required` (caller derives this into
 *   `isSilentAuthFailed`) → fall back to an explicit `Prompt.Login`.
 *
 * All branches are gated on `accountCenterSettings?.enabled` to preserve the
 * disabled-tenant short-circuit added in #8637.
 */
export const useAuthRedirect = ({
  isInCallback,
  isSilentAuthFailed,
}: UseAuthRedirectProps): void => {
  const uiLocales = getUiLocales();
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const { accountCenterSettings, isLoadingExperience, isLoadingUserInfo, userInfoError } =
    useContext(PageContext);
  const isInitialAuthLoading = !isAuthenticated && isLoading;

  useEffect(() => {
    if (isInCallback || isInitialAuthLoading || isLoadingExperience) {
      return;
    }

    const extraParams = uiLocales ? { [ExtraParamsKey.UiLocales]: uiLocales } : undefined;

    if (isSilentAuthFailed && accountCenterSettings?.enabled) {
      // Prompt=none failed (no valid OIDC session); fall back to an explicit login.
      void signIn({ redirectUri, prompt: Prompt.Login, extraParams });
    } else if (!isAuthenticated && accountCenterSettings?.enabled) {
      setRouteRestore(window.location.pathname);
      void signIn({ redirectUri, extraParams });
    }
  }, [
    isAuthenticated,
    isInCallback,
    isInitialAuthLoading,
    isLoadingExperience,
    isSilentAuthFailed,
    accountCenterSettings,
    signIn,
    uiLocales,
  ]);

  useEffect(() => {
    if (isInCallback || isSilentAuthFailed) {
      return;
    }
    if (isInitialAuthLoading || !isAuthenticated || isLoadingUserInfo) {
      return;
    }

    // Skip re-authentication when account center is disabled - the API will always reject.
    // Otherwise let the OIDC provider decide: silent re-auth via the session cookie if
    // possible, and on failure it redirects back with error=login_required so the effect
    // above can trigger an explicit Prompt.Login.
    if (userInfoError && accountCenterSettings?.enabled) {
      const extraParams = uiLocales ? { [ExtraParamsKey.UiLocales]: uiLocales } : undefined;
      setRouteRestore(window.location.pathname);
      void signIn({ redirectUri, prompt: Prompt.None, extraParams });
    }
  }, [
    accountCenterSettings,
    isAuthenticated,
    isInCallback,
    isSilentAuthFailed,
    isInitialAuthLoading,
    isLoadingUserInfo,
    signIn,
    uiLocales,
    userInfoError,
  ]);
};
